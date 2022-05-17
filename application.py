from io import BytesIO
import os
import datetime
import hashlib

from flask import Flask, render_template, jsonify, request, make_response,send_file
from flask_socketio import SocketIO, emit, join_room, leave_room

# utils
from utils import without_keys

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# conceptos a recordar:

# Puedo emitir un evento del cliente hacia el servidor
# Puedo enviar un evento al client como emit igualmente
# para enviar los recursos puedo usar rutas dinamicas como /image/<algo>

def get_image_test():
    image = open('./static/images/platzi.png', 'rb')
    image_read = image.read()
    image.close()
    return BytesIO(image_read)

def get_image(image_form):
    return BytesIO(image_form)


database = {
    'session': {
    },
    'headers': {
        'users_count': 0,
        'channels_count': 0
    },
    'users': {
    },
    'channels': {
    }
}

def get_channel_user():
    my_channels = {}

    username = database['session'].get(request.cookies.get('session'), {}).get('user', None)
    user_id = database['users'].get(username, {}).get('id', None)

    for channel in database['channels'].keys():
        if user_id in database['channels'][channel]['users']:
            my_channels[channel] = {
                **database['channels'][channel],
                # esto es para no enviar el binario por el evento
                'image': {
                    'image_binary': ''
                }
            }

@socketio.on('connect')
def connect(socket):
    print('Cliente conectado')


@socketio.on('channels list')
def channels_list():
    my_channels = {}
    username = database['session'].get(request.cookies.get('session'), {}).get('user', None)
    user_id = database['users'].get(username, {}).get('id', None)

    for channel in database['channels'].keys():
        if user_id in database['channels'][channel]['users']:
            my_channels[channel] = {
                **database['channels'][channel],
                # esto es para no enviar el binario por el evento
                'image': {
                    **database['channels'][channel]['image'],
                    'image_binary': ''
                }
            }

    emit('channels list', my_channels, broadcast=True)

@socketio.on('join channel')
def join_channel(channel):
    room = f'{channel} join-load'
    join_room(room)

    channels_list = []
    message_channel = database['channels'][channel]['messages']

    for message in message_channel:
        print('here message')
        print(message)
        if message['image'] != None:
            print({
                **message,
                'image': {
                    **message['image'],
                    'image_binary': ''
                }
            })
            channels_list.append({
                **message,
                'image': {
                    **message['image'],
                    'image_binary': ''
                }
            })
        else:
            channels_list.append({
                **message,
            })

    emit(room, {
        'messages': channels_list
    }, room=room)

# Autenticacion
def auth(hash_session):
    if hash_session is None:
        return jsonify({
            'success': False,
            'message': 'No te has autenticado'
        }), 200
    
    get_name_session = database['session'].get(hash_session, {}).get('user', None)

    if get_name_session in database['users']:
        return jsonify({
            'success': True,
            'message': 'Autenticado'
        }), 200

    else:
        return jsonify({
            'success': False,
            'message': 'No tienes acceso, este usuario aun no esta registrado'
        }), 403


@app.route("/", methods=['GET', 'POST'])
def _index():
    my_channels = {}
    username = database['session'].get(request.cookies.get('session'), {}).get('user', None)
    user_id = database['users'].get(username, {}).get('id', None)

    for channel in database['channels'].keys():
        if user_id in database['channels'][channel]['users']:
            my_channels[channel] = {
                **database['channels'][channel],
                'image': {
                    **database['channels'][channel]['image'],
                    'image_binary': ''
                }
            }
    
    return render_template("index.html", channels=my_channels)

@app.route('/add-user', methods=['POST'])
def add_user_channel():
    username = request.form.get('username')
    channel = request.form.get('channel')

    if database['users'][username]['id'] in database['channels'][channel]['users']:
        return jsonify({
            'success': False,
            'message': 'El usuario ya esta en el canal'
        })

    # add user to channel
    database['channels'][channel]['users'].append(database['users'][username]['id'])

    return jsonify({
        'success': True,
        'message': 'Usuario agregado'
    })

@app.route('/create-channel', methods=['POST'])
def upload_channel_image():
    image_upload = request.files.get('image_channel')
    channel_name = request.form.get('channel_name')
    mime_type = image_upload.content_type
    user_name = database['session'].get(request.cookies.get('session'), {}).get('user', None)
    user_id = database['users'].get(user_name, {}).get('id', None)

    image_data = image_upload.read()
    image_upload.close()

    if channel_name in database['channels']:
        return jsonify({
            'success': False,
            'message': 'Ya existe un canal con ese nombre'
        }), 403

    channel_dict = {
        'id': database['headers']['channels_count'] + 1,
        'users': [user_id],
        'image': {
            'image_binary': lambda: get_image(image_data),
            'url': f'/images/channel/{channel_name}',
            'mime_type': mime_type
        },
        'messages': []
    }

    database['headers']['channels_count'] += 1
    database['channels'][channel_name] = channel_dict


    return jsonify({
        'success': True,
        'message': 'Canal creado'
    })

@app.route('/send_message', methods=['POST'])
def send_message_controller():
    message = request.form.get('message')
    image = request.files.get('image')
    channel_name = request.form.get('channel_name')

    print(image)
    image_info = None
    if image != None:
        image_data = image.read()
        image.close()
        image_info = {
            'image_binary': lambda: get_image(image_data),
            'url': f'/images/channel/{channel_name}',
            'mime_type': image.mimetype
        }


    if len(database['channels'][channel_name]['messages']) == 100:
        return jsonify({
            'success': False,
            'message': 'El canal ha alcanzado el limite de mensajes'
        }), 403
    if len(database['channels'][channel_name]['messages']) > 1:
            message_id = database['channels'][channel_name]['messages'][0]['id'] + 1
    else:
        message_id = 1

    author = database['session'].get(request.cookies.get('session'), {}).get('user', None)
    
    if author is None:
        # generate error
        raise Exception('No te has autenticado')

    message_dict = {
        'id': message_id,
        'author': author,
        'message': message,
        'image': image_info,
        'timestamp': datetime.datetime.timestamp(datetime.datetime.now())
    }

    database['channels'][channel_name]['messages'].append(message_dict)
    
    return jsonify({
        'success': True,
        'message': 'Mensaje enviado'
    })

@app.route("/auth", methods=['GET', 'POST'])
def _auth():
    if request.method == 'POST':
        name = request.form.get('username')
        try:
            if database['users'].get(name) is None:
                database['users'][name] = {
                    'id': database['headers']['users_count'] + 1
                }
                database['headers']['users_count'] += 1

            if not request.cookies.get('session'):
                # get name of cookie
                get_name_session = database['session'].get(request.cookies.get('session'), {}).get('session', None)
                if get_name_session in database['users']:
                    
                    response_ = make_response(jsonify({
                        'success': False,
                        'message': 'Hay una session pero el usuario no existe'
                    }))
                    response_.set_cookie('token', '', expires=0)
                    return response_, 403

            hash_user = hashlib.sha256(name.encode()).hexdigest()
            # add to session
            database['session'][hash_user] = {
                'user': name
            }
            
            response = make_response(jsonify({
                'success': True,
                'message': 'Autenticado :D'
            }))
            response.set_cookie('session', hash_user, httponly=True, expires=datetime.datetime.now() + datetime.timedelta(days=1))

            return response, 200
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'No se puede agregar este usuario',
                'error': str(e)
            }), 404

    return auth(request.cookies.get('session'))

@app.route("/images/channel/<channel>")
def image_channel(channel):
    get_image = database['channels'][channel]['image']['image_binary']
    get_mime_type = database['channels'][channel]['image']['mime_type']

    return send_file(get_image(), mimetype=get_mime_type)

@app.route("/imagen/<name>")
def image(name):

    return send_file(f'./static/images/{name}')

@app.route("/bytes")
def bytes_j():
    temp_image1 = BytesIO(get_image())

    return send_file(temp_image1, mimetype='image/png')
