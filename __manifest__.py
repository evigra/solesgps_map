# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
{
    'name' : 'SolesGPS Map',
    'author': "SolesGPS :: Eduardo Vizcaino",
    'category': 'fleet, GPS, Geolocation',
    'website' : 'https://solesgps.com',
    'summary' : 'GPS Map Online',
    'description' : """
Vehicle, leasing, insurances, cost
==================================
With this module, Odoo helps you managing all your vehicles, the
contracts associated to those vehicle as well as services, fuel log
entries, costs and many other features necessary to the management 
of your fleet of vehicle(s)

Main Features
-------------
* Add vehicles to your fleet
* Manage contracts for vehicles
* Reminder when a contract reach its expiration date
* Add services, fuel log entry, odometer values for all vehicles
* Show all costs associated to a vehicle or to a type of service
* Analysis graph for costs
""",
    'depends': [
        'fleet',
    ],
    'data': [
        'security/fleet_security.xml',
#        'security/ir.model.access.csv',
        'views/gpsmap_menuitem.xml',
        'views/gpsmap_views.xml',
    ],

    'demo': ['data/gpsmap_demo.xml'],
    'qweb': ['static/src/xml/*.xml'],
    'installable': True,
    'application': True,
}
