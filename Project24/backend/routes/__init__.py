from flask import Blueprint

api_bp = Blueprint('api', __name__, url_prefix='/api')

from routes.pets import pets_bp
from routes.devices import devices_bp
from routes.alerts import alerts_bp
from routes.stats import stats_bp

api_bp.register_blueprint(pets_bp, url_prefix='/pets')
api_bp.register_blueprint(devices_bp, url_prefix='/devices')
api_bp.register_blueprint(alerts_bp, url_prefix='/alerts')
api_bp.register_blueprint(stats_bp, url_prefix='/stats')
