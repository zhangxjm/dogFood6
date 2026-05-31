from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseRedirect
from django.urls import reverse
from django.utils import timezone
from .models import Program, Schedule, PlayRecord, Submission


def index(request):
    programs_count = Program.objects.filter(status='active').count()
    schedules_count = Schedule.objects.filter(is_active=True).count()
    records_count = PlayRecord.objects.count()
    pending_submissions = Submission.objects.filter(status='pending').count()

    today = timezone.now().weekday() + 1
    today_schedule = Schedule.objects.filter(weekday=today, is_active=True).order_by('start_time')[:5]

    recent_records = PlayRecord.objects.all()[:5]
    recent_submissions = Submission.objects.all()[:5]

    context = {
        'programs_count': programs_count,
        'schedules_count': schedules_count,
        'records_count': records_count,
        'pending_submissions': pending_submissions,
        'today_schedule': today_schedule,
        'recent_records': recent_records,
        'recent_submissions': recent_submissions,
    }
    return render(request, 'index.html', context)


def program_list(request):
    programs = Program.objects.all()
    return render(request, 'program_list.html', {'programs': programs})


def program_detail(request, program_id):
    program = get_object_or_404(Program, id=program_id)
    schedules = Schedule.objects.filter(program=program)
    records = PlayRecord.objects.filter(program=program)[:10]
    return render(request, 'program_detail.html', {
        'program': program,
        'schedules': schedules,
        'records': records,
    })


def schedule_list(request):
    schedules = Schedule.objects.filter(is_active=True)
    schedule_by_day = {}
    weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    for day in range(1, 8):
        schedule_by_day[weekdays[day-1]] = schedules.filter(weekday=day)
    return render(request, 'schedule_list.html', {
        'schedule_by_day': schedule_by_day,
    })


def play_record_list(request):
    records = PlayRecord.objects.all()
    return render(request, 'play_record_list.html', {'records': records})


def submission_list(request):
    submissions = Submission.objects.all()
    return render(request, 'submission_list.html', {'submissions': submissions})


def submission_new(request):
    if request.method == 'POST':
        title = request.POST.get('title', '')
        submitter_name = request.POST.get('submitter_name', '')
        submitter_class = request.POST.get('submitter_class', '')
        submission_type = request.POST.get('submission_type', '')
        content = request.POST.get('content', '')
        contact = request.POST.get('contact', '')

        if title and submitter_name and content:
            Submission.objects.create(
                title=title,
                submitter_name=submitter_name,
                submitter_class=submitter_class,
                submission_type=submission_type,
                content=content,
                contact=contact,
            )
            return HttpResponseRedirect(reverse('submission_list'))

    return render(request, 'submission_new.html')
