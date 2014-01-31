<?php if(!defined('BASEPATH')) exit('No direct script access allowed');

function real_url()
{
  $CI =& get_instance();
  $lang = $CI->config->item('lang', 'app');
  if( $lang == 'es' )
    return $CI->config->slash_item('base_url');
  return $CI->config->slash_item('base_url'). "{$lang}/";
}

if ( ! function_exists('res_url'))
{
  function res_url()
  {
    $CI =& get_instance();
    return rtrim(rtrim($CI->config->item('base_url'), 'index.php/'),'/').'/layout/';
  }
}

if ( ! function_exists('upload_url'))
{
  function upload_url()
  {
    $CI =& get_instance();
    return rtrim(rtrim($CI->config->item('base_url'), 'index.php/'),'/').'/uploads/';
  }
}

if ( ! function_exists('thumbs_url'))
{
  function thumbs_url()
  {
    $CI =& get_instance();
    return $CI->config->item('base_url').'files/';
  }
}

if ( ! function_exists('process_keywords'))
{
  function process_keywords( $string = '' )
  {
    return str_replace(array(' , ',' ,',', '),',',rtrim(str_replace(array('&#8230;','.','-','|','_'),',',$string),','));
  }
}

if ( ! function_exists('prep_word_url'))
{
  function prep_word_url( $string, $spacer = "-" )
  {
    $string = rtrim(trim($string));
    $string = character_limiter($string,40,'');
    $string = mb_strtolower($string, 'UTF-8');
    $string = preg_replace ("/[ÁáÄäÂâ]/iu","a",$string);
    $string = preg_replace ("/[ÉéËëÊê]/iu","e",$string);
    $string = preg_replace ("/[ÍíÏïÎî]/iu","i",$string);
    $string = preg_replace ("/[ÓóÖöÔô]/iu","o",$string);
    $string = preg_replace ("/[ÚúÜüÛû]/iu","u",$string);
    $string = preg_replace ("/[Ññ]/iu","n",$string);
    $string = trim(preg_replace ("/[^ A-Za-z0-9_]/", " ", $string));
    $string = preg_replace ("/[ \t\n\r]+/", $spacer, $string);
    $string = str_replace(" ", $spacer, $string);
    $string = preg_replace ("/[ -]+/", $spacer, $string);
    return $string;
  }
}