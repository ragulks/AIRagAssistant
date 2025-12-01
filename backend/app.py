from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import tempfile
from werkzeug.utils import secure_filename
import threading
import time
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from database import db, User, ChatSession, ChatMessage

# Import your main RAG functions
from main import (
    process_uploaded_file,
    chat_query,
    clear_database,
    VECTOR_DB
)

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'docx'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB max file size

# Database & Auth Config
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'super-secret-key-change-this-in-production'  # Change this!

db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Create DB tables
with app.app_context():
    db.create_all()

# Global state to track processing
processing_status = {
    'is_processing': False,
    'progress': 0,
    'message': '',
    'current_file': None
}


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


# --- Auth Endpoints ---

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username already exists'}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({'token': access_token, 'username': user.username}), 200

    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    return jsonify({'username': user.username, 'id': user.id}), 200


# --- Chat History Endpoints ---

@app.route('/api/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    current_user_id = get_jwt_identity()
    sessions = ChatSession.query.filter_by(user_id=int(current_user_id)).order_by(ChatSession.created_at.desc()).all()
    
    return jsonify([{
        'id': s.id,
        'title': s.title or 'New Chat',
        'created_at': s.created_at.isoformat()
    } for s in sessions])

@app.route('/api/history', methods=['POST'])
@jwt_required()
def create_chat_session():
    current_user_id = get_jwt_identity()
    new_session = ChatSession(user_id=int(current_user_id), title="New Chat")
    db.session.add(new_session)
    db.session.commit()
    return jsonify({'id': new_session.id, 'title': new_session.title}), 201

@app.route('/api/history/<session_id>', methods=['GET'])
@jwt_required()
def get_session_messages(session_id):
    current_user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=int(current_user_id)).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
        
    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.created_at).all()
    
    return jsonify([{
        'role': m.role,
        'content': m.content,
        'created_at': m.created_at.isoformat()
    } for m in messages])

@app.route('/api/history/<session_id>', methods=['DELETE'])
@jwt_required()
def delete_chat_session(session_id):
    current_user_id = get_jwt_identity()
    session = ChatSession.query.filter_by(id=session_id, user_id=int(current_user_id)).first()
    
    if not session:
        return jsonify({'error': 'Session not found'}), 404
    
    db.session.delete(session)
    db.session.commit()
    return jsonify({'message': 'Session deleted successfully'}), 200


# --- Existing Endpoints (Modified for Auth/History) ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'RAG Chatbot API is running',
        'documents_loaded': len(VECTOR_DB) > 0,
        'chunks_count': len(VECTOR_DB)
    })


@app.route('/api/upload', methods=['POST'])
@jwt_required()
def upload_file():
    """Handle file upload and process it for RAG."""
    global processing_status

    try:
        # Check if a file is being processed
        if processing_status['is_processing']:
            return jsonify({
                'error': 'Another file is currently being processed. Please wait.'
            }), 429

        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not allowed_file(file.filename):
            return jsonify({
                'error': f'File type not supported. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400

        # Secure the filename
        filename = secure_filename(file.filename)

        # Save file temporarily
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)

        # Start processing in background thread
        def process_file_background():
            global processing_status
            try:
                processing_status.update({
                    'is_processing': True,
                    'progress': 0,
                    'message': 'Starting file processing...',
                    'current_file': filename
                })

                processing_status['message'] = 'Reading file...'
                processing_status['progress'] = 25

                # Process the file
                success = process_uploaded_file(file_path)

                processing_status['progress'] = 100

                if success:
                    processing_status['message'] = 'File processed successfully!'
                else:
                    processing_status['message'] = 'Failed to process file'

                # Keep status for a few seconds then reset
                time.sleep(2)
                processing_status.update({
                    'is_processing': False,
                    'progress': 0,
                    'message': '',
                    'current_file': None
                })

            except Exception as e:
                processing_status.update({
                    'is_processing': False,
                    'progress': 0,
                    'message': f'Error: {str(e)}',
                    'current_file': None
                })

        # Start background processing
        thread = threading.Thread(target=process_file_background)
        thread.daemon = True
        thread.start()

        return jsonify({
            'message': 'File upload started. Processing in background...',
            'filename': filename,
            'status': 'processing'
        })

    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500


@app.route('/api/upload/status', methods=['GET'])
@jwt_required()
def upload_status():
    """Get current upload/processing status."""
    return jsonify(processing_status)


@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    """Handle chat queries."""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()

        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        user_message = data['message'].strip()
        session_id = data.get('session_id')

        if not user_message:
            return jsonify({'error': 'Empty message'}), 400
            
        # Verify session belongs to user if provided
        if session_id:
            session = ChatSession.query.filter_by(id=session_id, user_id=int(current_user_id)).first()
            if not session:
                return jsonify({'error': 'Session not found'}), 404
                
            # Save user message
            user_msg_db = ChatMessage(session_id=session_id, role='user', content=user_message)
            db.session.add(user_msg_db)
            
            # Update session title if it's the first message
            if session.title == "New Chat":
                session.title = user_message[:30] + "..." if len(user_message) > 30 else user_message
                
            db.session.commit()

        # Check if any documents are loaded
        if len(VECTOR_DB) == 0:
            return jsonify({
                'response': 'No documents have been uploaded yet. Please upload a document first to ask questions.',
                'sources': [],
                'chunks_used': 0
            })

        # Process the query
        result = chat_query(user_message)
        
        # Save assistant response
        if session_id:
            ai_msg_db = ChatMessage(session_id=session_id, role='assistant', content=result['response'])
            db.session.add(ai_msg_db)
            db.session.commit()

        return jsonify({
            'response': result['response'],
            'sources': result['sources'],
            'chunks_used': result['chunks_used'],
            'query': user_message
        })

    except Exception as e:
        return jsonify({'error': f'Chat processing failed: {str(e)}'}), 500


@app.route('/api/clear', methods=['POST'])
@jwt_required()
def clear_documents():
    """Clear all loaded documents."""
    try:
        clear_database()

        # Also clear uploaded files
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Error deleting {filename}: {e}")

        return jsonify({
            'message': 'All documents and files cleared successfully',
            'chunks_count': len(VECTOR_DB)
        })

    except Exception as e:
        return jsonify({'error': f'Failed to clear documents: {str(e)}'}), 500


@app.route('/api/info', methods=['GET'])
def get_info():
    """Get current system information."""
    return jsonify({
        'documents_loaded': len(VECTOR_DB) > 0,
        'chunks_count': len(VECTOR_DB),
        'current_file': processing_status.get('current_file'),
        'is_processing': processing_status.get('is_processing'),
        'supported_formats': list(ALLOWED_EXTENSIONS),
        'max_file_size_mb': MAX_FILE_SIZE // (1024 * 1024)
    })


@app.errorhandler(413)
def too_large(e):
    """Handle file too large error."""
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413


@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors."""
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    print("Starting RAG Chatbot API...")
    print("Upload folder:", UPLOAD_FOLDER)
    print("Supported formats:", ", ".join(ALLOWED_EXTENSIONS))
    print("API will be available at: http://localhost:5000")
    print("\nAPI Endpoints:")
    print("  POST /api/upload     - Upload documents")
    print("  POST /api/chat       - Send chat messages")
    print("  GET  /api/info       - Get system info")
    print("  GET  /api/health     - Health check")
    print("  POST /api/clear      - Clear all documents")
    print("  GET  /api/upload/status - Get upload status")
    print("  POST /api/auth/register - Register new user")
    print("  POST /api/auth/login    - Login user")
    print("  DELETE /api/history/<id> - Delete chat session")

    app.run(debug=True, host='0.0.0.0', port=5000)