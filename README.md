# Project 2 FLACK <img src="./static/icons/slack-black.svg" height="36px" hspace="20" />

Web Programming with Python and JavaScript

Algunas opciones: Crear canal, imagen del canal, agregar usuarios al canal, etc

## Requisitos:

Chrome: 62>
Edge: 79>
Firefox: 67>
Internet explorer: 12>
Opera: 50>
Samsung: 8.2>

## Como esta distribuido el código.

La intefaz para funcionar esta dividida en diferentes archivos JavaScript:

1. main.js: Crea los custom elements y agrega los eventos de events.js
2. events.js: Maneja los eventos de la interfaz
3. sockets.js: maneja los eventos de los sockets.
4. alert.js: Enviar alertas en caso de error o dar aviso

## Base de datos.
Diccionario que almacenara la información de los libros

## Sesiones
Almacena los hash de cada session de los usuarios, se crea un hash

https://github.com/MiguelHG2351/cs50w-project2/blob/fe81ba8944781795f9ae84a8cd5d53b0cba4eb8d/application.py#L286

```python
    'session': {
    },
```

## Usuarios
Se almacenan con la clave del nombre del usuario y dentro del diccionario el id

```python
    'users': {
    },
```

## headers
Indexa los datos de usuario y canales

```python
    'headers': {
    },
```

## channels
Guarda los canales

https://github.com/MiguelHG2351/cs50w-project2/blob/fe81ba8944781795f9ae84a8cd5d53b0cba4eb8d/application.py#L196-L205

```python
    'channels': {
    },
```

