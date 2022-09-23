from rest_framework import serializers

from main_app.models import Pallet, Plant


class PalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pallet
        fields = ('id',
                  'time_1',
                  'time_2',
                  'time_3',
                  'path_1',
                  'path_2',
                  'path_3',
                  'id_type_plant',
                  'id_line')

class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ('id',
                  'center',
                  'id_type_plants',
                  'id_pallet',)



class AddPalletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pallet
        fields = ('id',)


class AddPlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = (
                  'id_type_plants',
                  'id_pallet',)
