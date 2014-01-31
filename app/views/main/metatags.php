<?php 
$headers = array();
$headers['titulo'] = $this->config->item('client', 'app');
$headers['keywords'] = 'Giovani pizza, giovani catering, giovani, pizza party capital federal, pizza party nordelta';
$headers['descripcion'] = 'Somos una empresa especializada en brindar el mejor servicio de catering para reuniones sociales y eventos empresariales. Nuestra materia prima, productos y personal marcan la diferencia por la óptima calidad y distinción. Ofrecemos un servicio de vanguardia y somos pioneros en Pizza Party.';
switch ($section) {
  case "servicios":
    $headers['titulo'] = 'Servicios - ' . $headers['titulo'];
    $headers['descripcion'] = 'Bebidas, Mesa dulce, Postres, Brindis, Vinos';
    $headers['keywords'] = 'Pizza Party, pizza libre, catering asados, catering, asados, catering zona norte, pizza party zona norte, asados zona norte, catering pizza, asados nordelta, asado capital federal, pizza party San Isidro, pizza party Vicente lopez, pizza party Belgrano, pizza party, cazuelas, cazuela zona norte, cazuela capital federal, comida mexicana, mexican party, catering mexicano, fondue, catering fondue';
    break;
  case "menu":
    $headers['titulo'] = 'Menú - ' . $headers['titulo'];
    $headers['descripcion'] = 'Pizza Party, Mexican Party, Asado, Cazuelas, Fondue';
    $headers['keywords'] = 'Pizza Party, pizza libre, catering asados, catering, asados, catering zona norte, pizza party zona norte, asados zona norte, catering pizza, asados nordelta, asado capital federal, pizza party San Isidro, pizza party Vicente lopez, pizza party Belgrano, pizza party, cazuelas, cazuela zona norte, cazuela capital federal, comida mexicana, mexican party, catering mexicano, fondue, catering fondue';
    break;
  case "barra":
    $headers['titulo'] = 'Barra móvil - ' . $headers['titulo'];
    $headers['descripcion'] = 'Clásica, Importada, Premium';
    $headers['keywords'] = 'Barra móvil, barra libre, barra de tragos, barra fiesta, barra casamientos, barra de alcohol';
    break;
  case "clientes":
    $headers['titulo'] = 'Clientes - ' . $headers['titulo'];
    break;
  case "contacto":
    $headers['titulo'] = 'Contacto - ' . $headers['titulo'];
    break;
}

if( isset($headers) && $headers ):?>
<title id="head-title"><?php echo $headers['titulo'] ?></title>
<meta property="og:title" name="og:title" content="<?php echo $headers['titulo'] ?>" />
<meta id="head-description" name="description" content="<?php echo $headers['descripcion'] ?>" />
<meta property="og:description" name="og:description" content="<?php echo $headers['descripcion'] ?>" />
<meta id="head-keywords" name="keywords" content="<?php echo $headers['keywords'] ?>" /><?php else: ?>
<title id="head-title"><?php echo $this->config->item('client', 'app') ?></title>
<meta property="og:title" name="og:title" content="<?php echo $this->config->item('client', 'app') ?>" />
<meta id="head-description" name="description" content="" />
<meta property="og:description" name="og:description" content="" />
<meta id="head-keywords" name="keywords" content="" /><?php endif ?>
<?php if( isset($headers['og:image']) ):?>
<meta property="og:image" name="og:image" content="<?php echo $headers['og:image'] ?>" />
<?php else: ?>
<meta property="og:image" name="og:image" content="<?php echo res_url() ?>logo.png" />
<?php endif ?>
<meta property="og:url" name="og:url" content="<?php echo current_url() ?>" />
<meta property="og:type" name="og:type" content="website" />