import http.client

CONST_IP = '***********'
conn = http.client.HTTPConnection("ifconfig.me")
conn.request("GET", "/ip")
if conn.getresponse().read().decode('utf-8') == CONST_IP:
    CONST_RESULT_FOLDER = '/root/IMG_stitch/result_photos/'
    broker_ip = 'localhost'         # IP-адресс брокера.
    db_host = 'localhost'           # IP-адерс БД теплицы
else:
    CONST_RESULT_FOLDER = 'D:/GreenStuff/GE_image_stitching/result_photos/'
    broker_ip = '************'    # IP-адресс брокера. Совпадает с IP-адресом главного сервера
    db_host = '************'      # IP-адерс БД теплицы

CONST_RAW_FOLDER = 'D:/GreenStuff/GE_image_stitching/photos/tmp_1/'