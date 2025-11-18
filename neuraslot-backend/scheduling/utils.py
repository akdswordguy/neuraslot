from .models import Activity

def log_activity(action, entity, description, user=None):
    Activity.objects.create(
        action=action,
        entity=entity,
        description=description,
        user=user
    )
