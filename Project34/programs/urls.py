from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('programs/', views.program_list, name='program_list'),
    path('programs/<int:program_id>/', views.program_detail, name='program_detail'),
    path('schedule/', views.schedule_list, name='schedule_list'),
    path('records/', views.play_record_list, name='play_record_list'),
    path('submissions/', views.submission_list, name='submission_list'),
    path('submissions/new/', views.submission_new, name='submission_new'),
]
