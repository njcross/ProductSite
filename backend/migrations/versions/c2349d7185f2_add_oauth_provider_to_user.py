"""Add oauth_provider to User

Revision ID: c2349d7185f2
Revises: 
Create Date: 2025-05-01 14:53:24.938653

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'c2349d7185f2'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('cart_items', schema=None) as batch_op:
        #batch_op.add_column(sa.Column('kit_id', sa.Integer(), nullable=False))
        batch_op.drop_constraint('cart_items_ibfk_2', type_='foreignkey')
        batch_op.create_foreign_key(None, 'kits', ['kit_id'], ['id'])
        #batch_op.drop_column('character_id')

    with op.batch_alter_table('favorites', schema=None) as batch_op:
        #batch_op.add_column(sa.Column('kit_id', sa.Integer(), nullable=True))
        batch_op.drop_constraint('favorites_ibfk_2', type_='foreignkey')
        batch_op.create_foreign_key(None, 'kits', ['kit_id'], ['id'])
        #batch_op.drop_column('character_id')
    op.drop_table('characters')
    with op.batch_alter_table('kit_age', schema=None) as batch_op:
        batch_op.alter_column('kit_id',
               existing_type=mysql.INTEGER(),
               nullable=False)
        batch_op.alter_column('age_id',
               existing_type=mysql.INTEGER(),
               nullable=False)

    with op.batch_alter_table('kit_category', schema=None) as batch_op:
        batch_op.alter_column('kit_id',
               existing_type=mysql.INTEGER(),
               nullable=False)
        batch_op.alter_column('category_id',
               existing_type=mysql.INTEGER(),
               nullable=False)

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('oauth_provider', sa.String(length=50), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('oauth_provider')

    with op.batch_alter_table('kit_category', schema=None) as batch_op:
        batch_op.alter_column('category_id',
               existing_type=mysql.INTEGER(),
               nullable=True)
        batch_op.alter_column('kit_id',
               existing_type=mysql.INTEGER(),
               nullable=True)

    with op.batch_alter_table('kit_age', schema=None) as batch_op:
        batch_op.alter_column('age_id',
               existing_type=mysql.INTEGER(),
               nullable=True)
        batch_op.alter_column('kit_id',
               existing_type=mysql.INTEGER(),
               nullable=True)

    with op.batch_alter_table('favorites', schema=None) as batch_op:
        batch_op.add_column(sa.Column('character_id', mysql.INTEGER(), autoincrement=False, nullable=True))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('favorites_ibfk_2', 'characters', ['character_id'], ['id'])
        batch_op.drop_column('kit_id')

    with op.batch_alter_table('cart_items', schema=None) as batch_op:
        batch_op.add_column(sa.Column('character_id', mysql.INTEGER(), autoincrement=False, nullable=False))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_foreign_key('cart_items_ibfk_2', 'characters', ['character_id'], ['id'])
        batch_op.drop_column('kit_id')

    op.create_table('characters',
    sa.Column('id', mysql.INTEGER(), autoincrement=True, nullable=False),
    sa.Column('name', mysql.VARCHAR(length=100), nullable=False),
    sa.Column('alias', mysql.VARCHAR(length=100), nullable=False),
    sa.Column('alignment', mysql.ENUM('hero', 'villain'), nullable=False),
    sa.Column('powers', mysql.TEXT(), nullable=False),
    sa.Column('image_url', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('price', mysql.FLOAT(), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_0900_ai_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    # ### end Alembic commands ###
