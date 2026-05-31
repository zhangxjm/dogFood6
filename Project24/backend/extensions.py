from flask import current_app

def get_mqtt_client():
    try:
        app = current_app._get_current_object()
        client = getattr(app, 'mqtt_client', None)
        if client is None:
            client = app.extensions.get('mqtt_client')
        return client
    except Exception as e:
        return None
