# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.

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

    """
    def cron_demo_create_position(self, cr, uid):    
        positions_obj   = self.pool.get('gpsmap.positions')    
        vehicle_obj     = self.pool.get('fleet.vehicle')
        
    
        print('========== CRON LALO')
        vehicle_args  =[]
        vehicle_ids   =vehicle_obj.search(cr, uid, args_positions,0,200)

        if len(vehicle_ids)>0:         
            for vehicle_id in vehicle_ids:
                print('vehicle_id=',vehicle_id)
                positions_arg               =[['deviceid','=',vehicle_id]]                
                positions_ids               =positions_obj.search(cr, uid, args_positions,1)
                                
                data_create={}        
                data_create['protocol']     ='tk103'
                data_create['deviceid']     =vehicle_id
                data_create['servertime']   =fields.Datetime.now()
                data_create['devicetime']   =fields.Datetime.now()
                data_create['fixtime']      =fields.Datetime.now()
                data_create['valid']        =''
                data_create['latitude']     =''
                data_create['longitude']    =''
                data_create['altitude']     =''
                data_create['speed']        =Math.random()
                data_create['course']=''
                data_create['address']=''
                data_create['attributes']=''
                data_create['other']=''
                data_create['leido']=''
                data_create['event']=''
                
                #positions_id=super(positions, self).create(cr, uid, data_create, context=None)
        
    """    

