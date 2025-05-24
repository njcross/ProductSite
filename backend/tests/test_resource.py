import pytest
from app.models.resource import Resource

def test_create_resource_instance():
    resource = Resource(
        title="Sample Resource",
        description="A sample downloadable item.",
        thumbnail_url="https://example.com/thumb.jpg",
        file_url="https://example.com/file.pdf"
    )
    assert resource.title == "Sample Resource"
    assert resource.description == "A sample downloadable item."
    assert resource.thumbnail_url.endswith(".jpg")
    assert resource.file_url.endswith(".pdf")