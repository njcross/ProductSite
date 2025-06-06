from .user_schema import user_schema, users_schema
from .kit_schema import kit_schema, kits_schema
from .cart_schema import cart_schema, carts_schema
from .newsletter_schema import newsletter_schema, newsletters_schema
from .favorite_schema import favorite_schema, favorites_schema
from .review_schema import review_schema, reviews_schema
from .purchase_schema import purchase_schema, purchases_schema
from .inventory_schema import inventory_schema, inventories_schema
from .resource_schema import resource_schema, resources_schema
from .shipping_address_schema import shipping_address_schema, shipping_addresses_schema
from .newsletter_message_schema import newsletter_message_schema, newsletter_messages_schema

__all__ = [
    "user_schema", "users_schema",
    "kit_schema", "kits_schema",
    "cart_schema", "carts_schema",
    "newsletter_schema", "newsletters_schema",
    "favorite_schema", "favorites_schema",
    "review_schema", "reviews_schema",
    "purchase_schema", "purchases_schema",
    "inventory_schema", "inventories_schema",
    "resource_schema", "resources_schema",
    "shipping_address_schema", "shipping_addresses_schema",
    "newsletter_message_schema", "newsletter_messages_schema"
]
