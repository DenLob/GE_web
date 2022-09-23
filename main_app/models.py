from django.db import models


class AccidentDeviation(models.Model):
    id = models.IntegerField(primary_key=True)
    id_type_deviation = models.ForeignKey('Deviations', models.DO_NOTHING, db_column='id_type_deviation')
    id_camera = models.ForeignKey('Camera', models.DO_NOTHING, db_column='id_camera')

    class Meta:
        managed = False
        db_table = 'accident_deviation'


class Camera(models.Model):
    id = models.IntegerField(primary_key=True)
    point = models.IntegerField(verbose_name='Этап')
    array_lines = models.CharField(max_length=1, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'camera'
        verbose_name = 'Камера'
        verbose_name_plural = 'Камеры'


class Deviations(models.Model):
    name = models.CharField(max_length=300)

    class Meta:
        managed = False
        db_table = 'deviations'
        verbose_name = 'Вид отклонения'
        verbose_name_plural = 'Виды отклонений'

    def __str__(self):
        return self.name


class DeviationsPlants(models.Model):
    id_plant = models.ForeignKey('Plant', models.DO_NOTHING, db_column='id_plant')
    id_acc_dev = models.ForeignKey(AccidentDeviation, models.DO_NOTHING, db_column='id_acc_dev')

    class Meta:
        managed = False
        db_table = 'deviations_plants'


class Line(models.Model):
    id = models.IntegerField(primary_key=True)
    number = models.IntegerField()
    id_zone = models.ForeignKey('Zone', models.DO_NOTHING, db_column='id_zone')

    class Meta:
        managed = False
        db_table = 'line'

    def __str__(self):
        return str(self.number)


class Pallet(models.Model):
    id = models.IntegerField(primary_key=True)
    time_1 = models.BigIntegerField(blank=True, null=True)
    time_2 = models.BigIntegerField(blank=True, null=True)
    time_3 = models.BigIntegerField(blank=True, null=True)
    path_1 = models.TextField(blank=True, null=True)
    path_2 = models.TextField(blank=True, null=True)
    path_3 = models.TextField(blank=True, null=True)
    id_type_plant = models.ForeignKey('TypePlant', models.DO_NOTHING, db_column='id_type_plant', blank=True, null=True)
    id_line = models.ForeignKey(Line, models.DO_NOTHING, db_column='id_line', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'pallet'
        verbose_name = 'Поддон'
        verbose_name_plural = 'Поддоны'


class Plant(models.Model):
    id = models.IntegerField(primary_key=True)
    center = models.TextField(blank=True, null=True)
    id_type_plants = models.ForeignKey('TypePlant', models.DO_NOTHING, db_column='id_type_plants')
    id_pallet = models.ForeignKey(Pallet, models.DO_NOTHING, db_column='id_pallet')

    class Meta:
        managed = False
        db_table = 'plant'


class TypePlant(models.Model):
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=300)

    class Meta:
        managed = False
        db_table = 'type_plant'
        verbose_name = 'Вид растения'
        verbose_name_plural = 'Виды растений'

    def __str__(self):
        return self.name


class Zone(models.Model):
    id = models.IntegerField(primary_key=True)
    number = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'zone'

    def __str__(self):
        return str(self.number)
