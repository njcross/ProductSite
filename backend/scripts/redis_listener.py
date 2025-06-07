import redis
import json
from time import sleep
from app import create_app, db
from app.models import Inventory

# Flask app context setup
app = create_app()
r = redis.Redis(host='localhost', port=6379, db=0)

print("🔄 Inventory rollback listener started")

pubsub = r.pubsub()
pubsub.psubscribe('__keyevent@0__:expired')

with app.app_context():
    for message in pubsub.listen():
        if message['type'] != 'pmessage':
            continue

        key = message['data'].decode()
        if key.startswith("pending_inventory:"):
            try:
                metadata_key = f"{key}:data"
                rollback_data_raw = r.get(metadata_key)
                if rollback_data_raw:
                    rollback_data = json.loads(rollback_data_raw)
                    inv = Inventory.query.get(rollback_data['inventory_id'])
                    if inv:
                        inv.quantity += rollback_data['quantity']
                        db.session.commit()
                        print(f"✅ Rolled back inventory for ID {inv.id}")
                    r.delete(metadata_key)
            except Exception as e:
                print(f"❌ Error handling rollback for {key}: {e}")
