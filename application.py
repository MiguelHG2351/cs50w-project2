import os

from flask import Flask, render_template, send_file
from flask_socketio import SocketIO, emit
# from io import BytesIO

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

# conceptos a recordar:

# Puedo emitir un evento del cliente hacia el servidor
# Puedo enviar un evento al client como emit igualmente
# para enviar los recursos puedo usar rutas dinamicas como /image/<algo>

@app.route("/")
def index():

    return render_template("index.html")

@app.route("/imagen/<name>")
def image(name):

    return send_file(f'./static/images/{name}')
