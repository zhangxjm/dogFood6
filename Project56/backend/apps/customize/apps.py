from django.apps import AppConfig


class CustomizeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.customize'
    verbose_name = '个性定制'
