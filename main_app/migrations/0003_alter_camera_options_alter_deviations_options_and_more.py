# Generated by Django 4.0.6 on 2022-08-23 10:46

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main_app', '0002_delete_sensor_delete_value'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='camera',
            options={'managed': False, 'verbose_name': 'Камера', 'verbose_name_plural': 'Камеры'},
        ),
        migrations.AlterModelOptions(
            name='deviations',
            options={'managed': False, 'verbose_name': 'Вид отклонения', 'verbose_name_plural': 'Виды отклонений'},
        ),
        migrations.AlterModelOptions(
            name='pallet',
            options={'managed': False, 'verbose_name': 'Поддон', 'verbose_name_plural': 'Поддоны'},
        ),
        migrations.AlterModelOptions(
            name='typeplant',
            options={'managed': False, 'verbose_name': 'Вид растения', 'verbose_name_plural': 'Виды растений'},
        ),
    ]
