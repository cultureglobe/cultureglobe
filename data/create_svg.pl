#!perl

use strict;
use SVG;
use Data::Dumper();

# data chart
my $svg_data =
  SVG->new( width => 540, height => 200, style => 'background-color: black' );
my $min_value=10000000;
my $max_value=0;
my %data_hash = ();
readData();

my $counter = 0;
foreach my $year(sort keys %data_hash){
	
	#print STDOUT "processing year=$year -> " . $data_hash{$year} . "\n";
	
	my $height = sprintf("%d",(($data_hash{$year}*100)/$max_value)/2);
	my $y_pos = sprintf("%d",50-$height);
	
	my $tag = $svg_data->rectangle(
		x      => $counter+10,
		y      => $y_pos,
		width  => 1,
		height => $height,
		id     => 'rect_' . $year,
		style  => { 'stroke' =>  'rgb(153,153,153)' } #'fill' => 'red', 'stroke-width' => 1,
	);
	$counter = $counter+2;
	
}

#open( OUT, ">H:\\EuropeanaTech\\Hackaton\\project\\data.svg" );
#print OUT $svg_data->xmlify;
#close(OUT);

# years
#my $svg =
#  SVG->new( width => 520, height => 200, style => 'background-color: black' );

for ( my $i = 0 ; $i <= 520 ; $i = $i + 2 ) {
	my $height = 1;
	my $y_pos  = 52;

	if ( $i == 0 || ( $i % 10 ) == 0 ) {
		$height = 5;
	}

	my $tag = $svg_data->rectangle(
		x      => $i+10,
		y      => $y_pos,
		width  => 1,
		height => $height,
		id     => 'rect_' . $i,
		style  => { 'stroke' => 'rgb(204,204,204)' } #'fill' => 'red', 'stroke-width' => 1,
	);
}

$svg_data->text( id => 't1750', x => 0, y => '70', style  => { 'stroke' => 'rgb(204,204,204)', 'fill' => 'rgb(204,204,204)', 'font-size' => '10px' }, -cdata => '1750');

$svg_data->text( id => 't1800', x => 100, y => '70', style  => { 'stroke' => 'rgb(204,204,204)', 'fill' => 'rgb(204,204,204)', 'font-size' => '11px' }, -cdata => '1800');

$svg_data->text( id => 't1850', x => 200, y => '70', style  => { 'stroke' => 'rgb(204,204,204)', 'fill' => 'rgb(204,204,204)', 'font-size' => '10px' }, -cdata => '1850');

$svg_data->text( id => 't1900', x => 300, y => '70', style  => { 'stroke' => 'rgb(204,204,204)', 'fill' => 'rgb(204,204,204)', 'font-size' => '11px' }, -cdata => '1900');

$svg_data->text( id => 't1950', x => 400, y => '70', style  => { 'stroke' => 'rgb(204,204,204)', 'fill' => 'rgb(204,204,204)', 'font-size' => '10px' }, -cdata => '1950');

$svg_data->text( id => 't2000', x => 500, y => '70', style  => { 'stroke' => 'rgb(204,204,204)', 'fill' => 'rgb(204,204,204)', 'font-size' => '11px' }, -cdata => '2000');

open( OUT, ">H:\\EuropeanaTech\\Hackaton\\project\\slider-img.svg" );
print OUT $svg_data->xmlify;
close(OUT);


# read data frpm csv file
sub readData {
	open(DATA,"<H:\\EuropeanaTech\\Hackaton\\project\\data_years.csv");
	
	while(my $line=<DATA>){
		chop $line;
		my ( $year, $cnt) = split(',',$line);
		
		if($cnt>$max_value){ $max_value = $cnt; }
		if($cnt<$min_value){ $min_value = $cnt; }
		
		$data_hash{$year}=$cnt;
		
	}
	print STDOUT "min=$min_value\n";
	print STDOUT "max=$max_value\n";
	
	close(DATA);
}


__DATA__

<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   width="520"
   height="100">
  <rect
     width="2"
     height="50"
     x="0"
     y="0" />
</svg>
