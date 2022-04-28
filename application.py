import os
import datetime

from flask import Flask, render_template, jsonify, request, make_response,send_file
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# conceptos a recordar:

# Puedo emitir un evento del cliente hacia el servidor
# Puedo enviar un evento al client como emit igualmente
# para enviar los recursos puedo usar rutas dinamicas como /image/<algo>

database = {
    'session': {
        'user': 'Miguel'
    },
    'headers': {
        'users_count': 1,
        'channels_count': 3
    },
    'users': {
        'Miguel': {
            'id': 1,
        }
    },
    'channels': {
        'web50xni': {
            'id': 1,
            'users': [1,2,3,4,5,6,7],
            'messages': [
                {
                    'id': 1,
                    'user_id': 1,
                    'author': 'Miguel',
                    'message': 'Bienvenido a Web50xni',
                    'timestamp': datetime.datetime.timestamp(datetime.datetime.now())
                }
            ]
        },
        'cs50xni': {
            'id': 1,
            'users': [1,2,3,4,5,6,7],
            'messages': [
                # {
                #     'id': 1,
                #     'user_id': 1,
                #     'author': 'Miguel',
                #     'message': 'Bienvenido a cs50xni',
                #     'timestamp': datetime.datetime.timestamp(datetime.datetime.now())
                # }
            ]
        },
        'unizzz': {
            'id': 3,
            'users': [2,3,4,5,6,7],
            'messages': [
                {
                    'id': 2,
                    'user_id': 1,
                    'author': 'Enrique',
                    'message': 'Este es un mensaje',
                    'timestamp': datetime.datetime.timestamp(datetime.datetime.now())
                }
            ]
        },
    }
}

@socketio.on('connect')
def connect(socket):
    print('Cliente conectado')

@socketio.on('join channel')
def join_channel(channel):
    room = f'{channel} join'
    join_room(room)

    message_channel = database['channels'][channel]['messages']
    print('Mensaje actualizado')
    print(message_channel)

    emit(room, {
        'messages': message_channel
    }, room=room)
    # message = {
    #     'id': database['channels'][room]['messages'][-1]['id'] + 1,
    #     'user_id': database['users'][database['session']['user']]['id'],
    #     'message': 'Aguacate',
    #     'timestamp': datetime.datetime.timestamp(datetime.datetime.now())
    # }
    # database['channels'][room]['messages'].append(message)
    # emit(room, message, room=room)

@socketio.on('send message')
def join_channel(sid, message):
    
    message_dict = {
        'id': database['channels'][sid]['messages'][-1]['id'] + 1,
        'user_id': database['users'][database['session']['user']]['id'],
        'author': database['session']['user'],
        'message': message,
        'timestamp': datetime.datetime.timestamp(datetime.datetime.now())
    }
    database['channels'][sid]['messages'].append(message_dict)
    print(f'{sid} messages')
    # print(database['channels'][sid]['messages'])
    join_room(f'{sid} messages')
    emit(f'{sid} messages', {
        'messages': database['channels'][sid]['messages']
    }, room=f'{sid} messages')

# Autenticacion
def auth(name):
    # if name in database['users'] and database['session']['user'] == name:
    if name in database['users']:
        return jsonify({
            'success': True,
            'message': 'Autenticado'
        }), 200

    else:
        return jsonify({
            'success': False,
            'message': 'No tienes acceso, no esta autenticado'
        }), 403


@app.route("/", methods=['GET', 'POST'])
def _index():
    my_channels = {}
    username = database['session']['user']
    user_id = database['users'].get(username, {}).get('id', None)

    print(database['users'])
    print(user_id)
    print(username)
    for channel in database['channels'].keys():
        if user_id in database['channels'][channel]['users']:
            my_channels[channel] = {
                **database['channels'][channel],
            }
    
    print(my_channels)

    return render_template("index.html", channels=my_channels)

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

            database['session']['user'] = name
            response = make_response(jsonify({
                'success': True,
                'message': 'Autenticado :D'
            }))
            response.set_cookie('session', name, httponly=True)

            return response, 200
        except:
            return jsonify({
                'success': False,
                'message': 'No se puede agregar este usuario'
            }), 404

    return auth(request.cookies.get('session'))

@app.route("/imagen/<name>")
def image(name):

    return send_file(f'./static/images/{name}')
