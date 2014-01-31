<?php

#define('TESTING', true);
define('ENVIRONMENT', 'development');

  if (defined('ENVIRONMENT'))
  {
    switch (ENVIRONMENT)
    {
      case 'development':
        error_reporting(E_ALL);
      break;
      case 'production':
        error_reporting(0);
      break;

      default:
        exit('The application environment is not set correctly.');
    }
  }

  $assign_to_config['base_url'] = 'http://giovanipizza.com.ar/';  
  
  $system_path = '_ci';

  $application_folder = 'app';

  if (defined('STDIN'))
  {
    chdir(dirname(__FILE__));
  }

  if (realpath($system_path) !== FALSE)
  {
    $system_path = realpath($system_path).'/';
  }

  $system_path = rtrim($system_path, '/').'/';

  if ( ! is_dir($system_path))
  {
    exit("Your system folder path does not appear to be set correctly. Please open the following file and correct this: ".pathinfo(__FILE__, PATHINFO_BASENAME));
  }

  define('SELF', pathinfo(__FILE__, PATHINFO_BASENAME));
  define('EXT', '.php');
  define('BASEPATH', str_replace("\\", "/", $system_path));
  define('FCPATH', str_replace(SELF, '', __FILE__));
  define('SYSDIR', trim(strrchr(trim(BASEPATH, '/'), '/'), '/'));  
  define('AJAX', isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest');
  
  if (is_dir($application_folder))
  {
    define('APPPATH', $application_folder.'/');
  }
  else
  {
    if ( ! is_dir(BASEPATH.$application_folder.'/'))
    {
      exit("Your application folder path does not appear to be set correctly. Please open the following file and correct this: ".SELF);
    }

    define('APPPATH', BASEPATH.$application_folder.'/');
  }  
  header('Content-Type: text/html; charset=utf-8'); 
  header("Vary: Accept");
  header("Access-Control-Allow-Headers: origin, x-request, x-requested-with, content-type, accept");
  header('Access-Control-Allow-Origin: *');  
  header('Access-Control-Allow-Methods: POST, GET, OPTIONS');  
  
require_once BASEPATH.'core/CodeIgniter.php';