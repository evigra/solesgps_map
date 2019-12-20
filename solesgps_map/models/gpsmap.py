# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import requests
from dateutil.relativedelta import relativedelta
from odoo import api, fields, models, _
class vehicle(models.Model):
    _inherit = "fleet.vehicle"
    image_vehicle = fields.Selection([
        ('01', 'Gray Vehicle'),
        ('02', 'Red Vehicle'),
        ('03', 'Camioneta Gris'),
        ('90', 'Black Phone'),
        ('91', 'Blue  Phone'),
        ('92', 'Green Phone'),
        ('93', 'Red  Phone')
        ], 'Img GPS', default='01', help='Image of GPS Vehicle', required=True)
    phone = fields.Char('Phone', size=50)
    imei = fields.Char('Imei', size=50)
    position_id = fields.Many2one('gpsmap.positions',ondelete='set null', string="Ultima Posicion", index=True)



class positions(models.Model):
    _name = "gpsmap.positions"
    _description = 'GPS Positions'
    _pointOnVertex=""
    protocol = fields.Char('Protocolo', size=15)
    deviceid = fields.Many2one('fleet.vehicle',ondelete='set null', string="Vehiculo", index=True)
    servertime = fields.Datetime('Server Time')
    devicetime = fields.Datetime('Device Time')
    fixtime = fields.Datetime('Error Time')
    valid = fields.Integer('Valido')
    latitude = fields.Float('Latitud',digits=(5,10))
    longitude = fields.Float('Longitud',digits=(5,10))
    altitude = fields.Float('Altura',digits=(6,2))
    speed = fields.Float('Velocidad',digits=(3,2))
    course = fields.Integer('Curso')    
    address = fields.Char('Calle', size=150)
    attributes = fields.Char('Atributos', size=5000)
    other = fields.Char('Otros', size=5000)
    leido = fields.Integer('Valido')
    event = fields.Char('Evento', size=70)
    
    def run_scheduler(self):
        positions_obj   =self.env['gpsmap.positions']
        vehicle_obj     =self.env['fleet.vehicle']
        
        vehicle_args  =[]
        vehicle_data   =vehicle_obj.search(vehicle_args, offset=0, limit=None, order=None)

        print('CRON LALO====================')        
        print('vehicles =',vehicle_data,' total=',len(vehicle_data))
        if len(vehicle_data)>0:         
            for vehicle in vehicle_data:
                positions_arg               =[('deviceid','=',vehicle.id)]                
                positions_data               =positions_obj.search(positions_arg, offset=0, limit=1, order='devicetime DESC')
                latitude=positions_data[0].latitude+.00356
                longitude=positions_data[0].longitude+.00356
                #print('vehicle_id=',vehicle.id, ' latitude =', positions_data[0].latitude)

                data_create={}        
                data_create['protocol']     ='tk103'
                data_create['deviceid']     =vehicle.id
                data_create['servertime']   =fields.Datetime.now()
                data_create['devicetime']   =fields.Datetime.now()
                data_create['fixtime']      =fields.Datetime.now()
                data_create['valid']        =''
                data_create['latitude']     =latitude
                data_create['longitude']    =longitude
                data_create['altitude']     =''
                #data_create['speed']        =Math.random()
                data_create['course']=''
                data_create['address']=''
                data_create['attributes']=''
                data_create['other']=''
                data_create['leido']=''
                data_create['event']=''
                
                positions_obj.create(data_create)    
