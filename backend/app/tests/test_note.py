"""
Tests for Note, NoteCategory, and NoteTag Models
"""
import pytest
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.note import Note, NoteCategory, NoteTag
from app.models.user import User


class TestNoteCategory:
    """Test cases for NoteCategory model"""

    def test_create_note_category(self, db_session: Session, test_user: User):
        """Test creating a note category instance"""
        category = NoteCategory(
            user_id=test_user.id,
            name="Study Notes",
            color="#3B82F6",
            icon="book",
            is_default=False
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert category.id is not None
        assert category.user_id == test_user.id
        assert category.name == "Study Notes"
        assert category.color == "#3B82F6"
        assert category.icon == "book"
        assert category.is_default is False
        assert category.created_at is not None
        assert category.updated_at is not None

    def test_note_category_default_values(self, db_session: Session, test_user: User):
        """Test that note category has default values"""
        category = NoteCategory(
            user_id=test_user.id,
            name="Default Category"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert category.color == "#3B82F6"
        assert category.icon == "folder"
        assert category.is_default is False

    def test_note_category_timestamps(self, db_session: Session, test_user: User):
        """Test that timestamps are set automatically"""
        category = NoteCategory(
            user_id=test_user.id,
            name="Timestamp Test"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        assert isinstance(category.created_at, datetime)
        assert isinstance(category.updated_at, datetime)
        assert category.created_at == category.updated_at

    def test_note_category_updated_at_changes(self, db_session: Session, test_user: User):
        """Test that updated_at changes when category is updated"""
        category = NoteCategory(
            user_id=test_user.id,
            name="Update Timestamp Test"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)

        original_updated_at = category.updated_at

        import time
        time.sleep(0.1)
        category.name = "Updated Name"
        db_session.commit()
        db_session.refresh(category)

        assert category.updated_at > original_updated_at

    def test_note_category_cascade_delete(self, db_session: Session, test_user: User):
        """Test that note categories are deleted when user is deleted"""
        category = NoteCategory(
            user_id=test_user.id,
            name="Cascade Test"
        )
        db_session.add(category)
        db_session.commit()

        category_id = category.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_category = db_session.get(NoteCategory, category_id)
        assert deleted_category is None


class TestNote:
    """Test cases for Note model"""

    @pytest.fixture
    def note_category(self, db_session: Session, test_user: User):
        """Create a test note category"""
        category = NoteCategory(
            user_id=test_user.id,
            name="Test Category"
        )
        db_session.add(category)
        db_session.commit()
        db_session.refresh(category)
        return category

    def test_create_note(self, db_session: Session, test_user: User, note_category: NoteCategory):
        """Test creating a note instance"""
        note = Note(
            user_id=test_user.id,
            category_id=note_category.id,
            title="My First Note",
            content="This is the content of my note",
            is_pinned=False,
            is_quick_note=False,
            theme="standard"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        assert note.id is not None
        assert note.user_id == test_user.id
        assert note.category_id == note_category.id
        assert note.title == "My First Note"
        assert note.content == "This is the content of my note"
        assert note.is_pinned is False
        assert note.is_quick_note is False
        assert note.theme == "standard"
        assert note.created_at is not None
        assert note.updated_at is not None

    def test_create_note_without_category(self, db_session: Session, test_user: User):
        """Test creating a note without a category"""
        note = Note(
            user_id=test_user.id,
            title="Note Without Category",
            content="Content here"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        assert note.category_id is None
        assert note.title == "Note Without Category"

    def test_note_default_values(self, db_session: Session, test_user: User):
        """Test that note has default values"""
        note = Note(
            user_id=test_user.id,
            title="Default Note"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        assert note.is_pinned is False
        assert note.is_quick_note is False
        assert note.theme == "standard"
        assert note.content is None
        assert note.source_context is None

    def test_note_timestamps(self, db_session: Session, test_user: User):
        """Test that timestamps are set automatically"""
        note = Note(
            user_id=test_user.id,
            title="Timestamp Test"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        assert isinstance(note.created_at, datetime)
        assert isinstance(note.updated_at, datetime)
        assert note.created_at == note.updated_at

    def test_note_updated_at_changes(self, db_session: Session, test_user: User):
        """Test that updated_at changes when note is updated"""
        note = Note(
            user_id=test_user.id,
            title="Update Timestamp Test"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        original_updated_at = note.updated_at

        import time
        time.sleep(0.1)
        note.title = "Updated Title"
        db_session.commit()
        db_session.refresh(note)

        assert note.updated_at > original_updated_at

    def test_note_id_is_uuid(self, db_session: Session, test_user: User):
        """Test that note id is a UUID"""
        note = Note(
            user_id=test_user.id,
            title="UUID Test"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        assert isinstance(note.id, uuid.UUID)
        assert isinstance(note.user_id, uuid.UUID)

    def test_note_update(self, db_session: Session, test_user: User):
        """Test updating a note"""
        note = Note(
            user_id=test_user.id,
            title="Original Title",
            content="Original Content",
            is_pinned=False,
            theme="standard"
        )
        db_session.add(note)
        db_session.commit()

        # Update fields
        note.title = "Updated Title"
        note.content = "Updated Content"
        note.is_pinned = True
        note.is_quick_note = True
        note.theme = "dark"
        note.source_context = "From Pomodoro session"
        db_session.commit()
        db_session.refresh(note)

        assert note.title == "Updated Title"
        assert note.content == "Updated Content"
        assert note.is_pinned is True
        assert note.is_quick_note is True
        assert note.theme == "dark"
        assert note.source_context == "From Pomodoro session"

    def test_note_delete(self, db_session: Session, test_user: User):
        """Test deleting a note"""
        note = Note(
            user_id=test_user.id,
            title="To Be Deleted"
        )
        db_session.add(note)
        db_session.commit()

        note_id = note.id
        db_session.delete(note)
        db_session.commit()

        deleted_note = db_session.get(Note, note_id)
        assert deleted_note is None

    def test_note_category_relationship(self, db_session: Session, test_user: User, note_category: NoteCategory):
        """Test the relationship between note and category"""
        note = Note(
            user_id=test_user.id,
            category_id=note_category.id,
            title="Relationship Test"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)

        assert note.category is not None
        assert note.category.id == note_category.id
        assert note.category.name == "Test Category"

    def test_note_category_set_null_on_delete(self, db_session: Session, test_user: User, note_category: NoteCategory):
        """Test that category_id is set to NULL when category is deleted"""
        note = Note(
            user_id=test_user.id,
            category_id=note_category.id,
            title="Set Null Test"
        )
        db_session.add(note)
        db_session.commit()

        note_id = note.id
        db_session.delete(note_category)
        db_session.commit()
        
        # Query note again to verify category_id is set to NULL
        updated_note = db_session.get(Note, note_id)
        assert updated_note is not None
        assert updated_note.category_id is None

    def test_note_cascade_delete(self, db_session: Session, test_user: User):
        """Test that notes are deleted when user is deleted"""
        note = Note(
            user_id=test_user.id,
            title="Cascade Test"
        )
        db_session.add(note)
        db_session.commit()

        note_id = note.id
        db_session.delete(test_user)
        db_session.commit()

        deleted_note = db_session.get(Note, note_id)
        assert deleted_note is None


class TestNoteTag:
    """Test cases for NoteTag model"""

    @pytest.fixture
    def test_note(self, db_session: Session, test_user: User):
        """Create a test note"""
        note = Note(
            user_id=test_user.id,
            title="Test Note"
        )
        db_session.add(note)
        db_session.commit()
        db_session.refresh(note)
        return note

    def test_create_note_tag(self, db_session: Session, test_note: Note):
        """Test creating a note tag"""
        tag = NoteTag(
            note_id=test_note.id,
            tag_name="important"
        )
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        assert tag.id is not None
        assert tag.note_id == test_note.id
        assert tag.tag_name == "important"
        assert tag.created_at is not None

    def test_note_tag_timestamp(self, db_session: Session, test_note: Note):
        """Test that created_at is set automatically"""
        tag = NoteTag(
            note_id=test_note.id,
            tag_name="timestamp-test"
        )
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        assert isinstance(tag.created_at, datetime)

    def test_note_tag_id_is_uuid(self, db_session: Session, test_note: Note):
        """Test that tag id is a UUID"""
        tag = NoteTag(
            note_id=test_note.id,
            tag_name="uuid-test"
        )
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        assert isinstance(tag.id, uuid.UUID)
        assert isinstance(tag.note_id, uuid.UUID)

    def test_note_tag_relationship(self, db_session: Session, test_note: Note):
        """Test the relationship between tag and note"""
        tag = NoteTag(
            note_id=test_note.id,
            tag_name="relationship-test"
        )
        db_session.add(tag)
        db_session.commit()
        db_session.refresh(tag)

        assert tag.note is not None
        assert tag.note.id == test_note.id
        assert tag.note.title == "Test Note"

    def test_note_tag_cascade_delete(self, db_session: Session, test_note: Note):
        """Test that tags are deleted when note is deleted"""
        tag = NoteTag(
            note_id=test_note.id,
            tag_name="cascade-test"
        )
        db_session.add(tag)
        db_session.commit()

        tag_id = tag.id
        db_session.delete(test_note)
        db_session.commit()

        deleted_tag = db_session.get(NoteTag, tag_id)
        assert deleted_tag is None

    def test_multiple_tags_per_note(self, db_session: Session, test_note: Note):
        """Test that a note can have multiple tags"""
        tag1 = NoteTag(
            note_id=test_note.id,
            tag_name="tag1"
        )
        tag2 = NoteTag(
            note_id=test_note.id,
            tag_name="tag2"
        )
        tag3 = NoteTag(
            note_id=test_note.id,
            tag_name="tag3"
        )
        db_session.add_all([tag1, tag2, tag3])
        db_session.commit()
        db_session.refresh(test_note)

        assert len(test_note.tags) == 3
        tag_names = [tag.tag_name for tag in test_note.tags]
        assert "tag1" in tag_names
        assert "tag2" in tag_names
        assert "tag3" in tag_names

