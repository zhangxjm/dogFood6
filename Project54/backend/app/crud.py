from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from datetime import datetime


def get_categories(db: Session, skip: int = 0, limit: int = 100):
    categories = db.query(models.Category).order_by(models.Category.sort_order, models.Category.id).offset(skip).limit(limit).all()
    result = []
    for cat in categories:
        cat_dict = schemas.Category.model_validate(cat).model_dump()
        cat_dict['template_count'] = len(cat.templates)
        result.append(cat_dict)
    return result


def get_category(db: Session, category_id: int):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category:
        cat_dict = schemas.Category.model_validate(category).model_dump()
        cat_dict['template_count'] = len(category.templates)
        return cat_dict
    return None


def get_category_by_name(db: Session, name: str):
    return db.query(models.Category).filter(models.Category.name == name).first()


def create_category(db: Session, category: schemas.CategoryCreate):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


def update_category(db: Session, category_id: int, category: schemas.CategoryUpdate):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category:
        for key, value in category.model_dump(exclude_unset=True).items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category


def delete_category(db: Session, category_id: int):
    db_category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if db_category:
        db.delete(db_category)
        db.commit()
        return True
    return False


def get_templates(db: Session, category_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Template)
    if category_id:
        query = query.filter(models.Template.category_id == category_id)
    templates = query.order_by(models.Template.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for tpl in templates:
        tpl_dict = schemas.Template.model_validate(tpl).model_dump()
        tpl_dict['notes_count'] = len(tpl.notes)
        result.append(tpl_dict)
    return result


def get_template(db: Session, template_id: int):
    template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if template:
        tpl_dict = schemas.Template.model_validate(template).model_dump()
        tpl_dict['notes_count'] = len(template.notes)
        return tpl_dict
    return None


def create_template(db: Session, template: schemas.TemplateCreate):
    db_template = models.Template(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template


def update_template(db: Session, template_id: int, template: schemas.TemplateUpdate):
    db_template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if db_template:
        for key, value in template.model_dump(exclude_unset=True).items():
            setattr(db_template, key, value)
        db.commit()
        db.refresh(db_template)
    return db_template


def delete_template(db: Session, template_id: int):
    db_template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if db_template:
        db.delete(db_template)
        db.commit()
        return True
    return False


def increment_download_count(db: Session, template_id: int):
    db_template = db.query(models.Template).filter(models.Template.id == template_id).first()
    if db_template:
        db_template.download_count += 1
        db.commit()
        db.refresh(db_template)
    return db_template


def get_notes(db: Session, template_id: int = None, skip: int = 0, limit: int = 100):
    query = db.query(models.Note)
    if template_id:
        query = query.filter(models.Note.template_id == template_id)
    return query.order_by(models.Note.created_at.desc()).offset(skip).limit(limit).all()


def get_note(db: Session, note_id: int):
    return db.query(models.Note).filter(models.Note.id == note_id).first()


def create_note(db: Session, note: schemas.NoteCreate):
    db_note = models.Note(**note.model_dump())
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, note_id: int, note: schemas.NoteUpdate):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        for key, value in note.model_dump(exclude_unset=True).items():
            setattr(db_note, key, value)
        db.commit()
        db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: int):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if db_note:
        db.delete(db_note)
        db.commit()
        return True
    return False
