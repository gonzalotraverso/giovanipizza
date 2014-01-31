<?php if(!defined('BASEPATH')) exit('No direct script access allowed');

$route['404_override'] = 'home/error';
$route['default_controller'] = "home";
$route['files(.*)'] = 'files$1';
$route['contacto(.*)'] = 'home/contacto/$1';
$route['(.*)'] = 'home/index/$1';