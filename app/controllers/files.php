<?php if(!defined('BASEPATH')) exit('No direct script access allowed');

class Files extends nzController
{

  public function crops( $size = '', $file = '' )
  {
    $security = array('290x200','600x300');
    if( !in_array($size, $security) ) exit;
    $filew = "uploads/crops/{$size}-{$file}";
    $thumb = SERVER . $filew;
    if(file_exists($thumb)) return redirect(base_url() . $filew);
    $this->load->library('image');
    $fileb = SERVER .  "uploads/{$file}";
    $sa = explode('x', $size);
    if(!file_exists($fileb) || count($sa) != 2) exit;
    $this
      ->image
      ->load($fileb)
      ->set_jpeg_quality(85)
      ->resize_crop($sa[0],$sa[1])
      ->save(SERVER . "uploads/crops/{$size}-{$file}")
      ->clear();
    redirect(base_url() . $filew);
  }

}