import base64
import datetime
import json
import math
import os.path
import shutil
import time

import pytz
from PIL import Image, ImageDraw, ImageFont
from PIL.ImageFile import ImageFile
from django.db.models.functions import TruncDate, Cast, Extract

from .help_funcs import tz

ImageFile.LOAD_TRUNCATED_IMAGES = True
import numpy
from django import template
from django.core.paginator import Paginator
from django.db.models import Q, Count, ExpressionWrapper, F, Value, Func, Subquery
from django.db.models.fields import reverse_related, DateField, CharField, IntegerField, DateTimeField, BigIntegerField
from django.http import HttpResponse
from rest_framework.pagination import PageNumberPagination
from sorl.thumbnail import get_thumbnail, delete

from ge_server.settings import MEDIA_ROOT
from .constants import CONST_RESULT_FOLDER
from .models import Zone, Line, Pallet, TypePlant, Plant

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import PalletSerializer, AddPalletSerializer, AddPlantSerializer, PlantSerializer

stat_data = []
day_stat_len = 0


class GetStatistics(APIView):
    serializer_class = PalletSerializer


    def get(self, request, format=None):
        global stat_data
        global day_stat_len
        print(request)
        page_number = request.GET.get('page')
        obj_per_page = request.GET.get('per_page')
        order = request.GET.get('order')
        order_by = request.GET.get('order_by')
        time_zone_offset_minutes = request.GET.get('tz')
        time_zone_offset_pgsql = int(time_zone_offset_minutes) * 60
        if order_by == 'date_end' or order_by == 'time_1':
            order_by = 'time_1'

        typePlants = TypePlant.objects.values('name')
        annotations = []
        for typePlant in typePlants:
            annotations.append(typePlant)
        plants = Plant.objects.annotate(time_1=(ExpressionWrapper(
            Func(Value('epoch'), TruncDate(ExpressionWrapper(Func(
                F('id_pallet__time_1') - time_zone_offset_pgsql, function='to_timestamp'),
                output_field=DateTimeField())
            ), function='date_part'),
            output_field=BigIntegerField())), date_end=F('time_1') + 2160000,
        )\
            .values('time_1', ).annotate(date_end=F('date_end'),Romaine_lettuce=Count('id_type_plants',
                                                                      filter=Q(id_type_plants__name='Romaine lettuce')),
                                                Lettuce=Count('id_type_plants',
                                                                      filter=Q(id_type_plants__name='Lettuce')),
                                                type1=Count('id_type_plants',
                                                                      filter=Q(id_type_plants__name='type1')),
                                                type2=Count('id_type_plants',
                                                            filter=Q(id_type_plants__name='type2')),
                                                type3=Count('id_type_plants',
                                                            filter=Q(id_type_plants__name='type3')),
                                                Undefined=Count('id_type_plants',
                                                            filter=Q(id_type_plants__name='Undefined')),
                                                total_count=Count('id')).order_by(
            '-' * (order == 'desc') + order_by)
        paginator = Paginator(plants, obj_per_page)

        page_obj = paginator.get_page(page_number)
        data = [{'time_1': kw['time_1'], 'date_end': kw['date_end'],
                 'Romaine lettuce': kw['Romaine_lettuce'], 'Lettuce':kw['Lettuce'], 'type1':kw['type1'], 'type2':kw['type2'], 'type3':kw['type3'], 'Undefined':kw['Undefined'],'total_count': kw['total_count']} for kw in
                page_obj.object_list]

        payload = {
            "page": {
                "current": page_obj.number,
                "has_next": page_obj.has_next(),
                "has_previous": page_obj.has_previous(),
                "num_pages": paginator.num_pages,
                "total_rows": paginator.count
            },
            "data": data,
        }
        return Response(json.dumps(payload), status=status.HTTP_200_OK)



class GetPallets(APIView):
    serializer_class = PalletSerializer
    look_url_kwargs = [x.name for x in list(filter(lambda i:
                                                   not isinstance(i, reverse_related.ManyToOneRel) and
                                                   not isinstance(i, reverse_related.OneToOneRel) and
                                                   not isinstance(i, reverse_related.ManyToManyRel) and
                                                   not isinstance(i, reverse_related.ForeignObjectRel),
                                                   Pallet._meta.get_fields()))]

    def get(self, request, format=None):
        global stat_data
        global day_stat_len
        page_number = request.GET.get('page')
        obj_per_page = request.GET.get('per_page')
        order = request.GET.get('order')
        order_by = request.GET.get('order_by')
        if order_by == 'date_end':
            order_by = 'time_1'
        client_today = request.GET.get('today')
        founded_kwargs = {}

        for i in self.look_url_kwargs:
            if request.GET.get(i) is not None:
                founded_kwargs[i] = request.GET.get(i)
        if len(founded_kwargs) != 0:
            filters = Q()
            for item in founded_kwargs:
                filters &= Q(**{item: founded_kwargs[item]})
            pallets = Pallet.objects.filter(filters).prefetch_related('plant_id_pallet')
        else:
            pallets = Pallet.objects.annotate(count=Count('plant')).filter(~Q(time_1=None)).order_by(
                '-' * (order == 'desc') + order_by)
            today = datetime.datetime.fromtimestamp(int(client_today) / 1000)
            next_day = today + datetime.timedelta(days=1)
            today = today.timestamp()
            next_day = int(next_day.timestamp())
            day_stat = Pallet.objects.annotate(count=Count('plant')).filter(time_1__gte=today, time_1__lt=next_day)


        paginator = Paginator(pallets, obj_per_page)

        page_obj = paginator.get_page(page_number)
        data = [{'id': kw.id, 'time_1': kw.time_1, 'date_end': str(int(kw.time_1) + 2160000),
                 'type_plant': str(kw.id_type_plant), 'count': kw.count, 'img': kw.path_1} for kw in
                page_obj.object_list]
        stat_data = [{'id': kw.id, 'time_1': kw.time_1, 'date_end': str(int(kw.time_1) + 2160000),
                      'type_plant': str(kw.id_type_plant), 'count': kw.count, 'img': kw.path_1} for kw in day_stat]

        payload = {
            "page": {
                "current": page_obj.number,
                "has_next": page_obj.has_next(),
                "has_previous": page_obj.has_previous(),
                "num_pages": paginator.num_pages,
                "total_rows": paginator.count
            },
            "data": data,
            "stat": stat_data
        }
        return Response(json.dumps(payload), status=status.HTTP_200_OK)


class SendImage(APIView):
    def get(self, request):
        pallet = Pallet.objects.get(pk=request.GET.get('id'))
        plants = Plant.objects.filter(id_pallet=request.GET.get('id'))
        img_path = CONST_RESULT_FOLDER + pallet.path_1.split('/')[-1]
        centers = [{'center': json.loads(i.center), 'type': str(i.id_type_plants)} for i in plants]
        font = ImageFont.truetype(MEDIA_ROOT + '/fonts/arial.ttf', 20)
        im = Image.open(img_path)
        imgWidth, imgHeight = im.size
        angle_true = 90.

        def rotate(x, y, xm, ym, a):
            a = -a * math.pi / 180
            xr = (x - xm) * math.cos(a) - (y - ym) * math.sin(a) + ym
            yr = (x - xm) * math.sin(a) + (y - ym) * math.cos(a) + xm

            return [xr, yr]

        im_rotate = im.rotate(angle_true, expand=True)
        draw = ImageDraw.Draw(im_rotate)
        for center in centers:
            x = int(center['center']['x'])
            y = int(center['center']['y'])
            # print('old',x,y)
            x, y = rotate(x, y, imgWidth / 2, imgHeight / 2, angle_true)
            # print(x, y)

            draw.ellipse((x - 10, y - 10, x + 10, y + 10), 'yellow')
            draw.text((x, y), center['type'], fill="black", font=font)

        im_rotate.save(MEDIA_ROOT + 'tmp.jpg', quality=100)
        with open(MEDIA_ROOT + 'tmp.jpg', "rb") as image_file:
            # im_rotate.save('guido_expand_90.jpg', quality=95)
            image_data = base64.b64encode(image_file.read()).decode('utf-8')
        os.remove(MEDIA_ROOT + 'tmp.jpg')
        payload = {
            'image': image_data
        }
        return Response(json.dumps(payload), status=status.HTTP_200_OK)

