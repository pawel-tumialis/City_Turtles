let myMap;
let canvas;
const mappa = new Mappa('Leaflet');
let PmGdaPowWiel;
let PmGdaPowWars;
let PmSopBiPlowc;
let PmGdaLeczkow;
let PmGdaWyzwole;
let PmGdyPorebsk;
let PmGdySzafran;
// Lets put all our map options in a single object
const options = {
  lat: 54.4,
  lng: 18.6,
  zoom: 10,
  style: "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
}

function setup(){
  canvas = createCanvas(640,640); 
  // background(100); let's uncomment this, we don't need it for now

  // Create a tile map with the options declared
  myMap = mappa.tileMap(options); 
  myMap.overlay(canvas);
 
  
}

function draw(){
clear();

  PmGdaPowWiel = myMap.latLngToPixel( 54.398639, 18.614333)
  PmGdaPowWars = myMap.latLngToPixel( 54.353336, 18.635283)
  PmSopBiPlowc = myMap.latLngToPixel( 54.43451, 18.57884)
  PmGdaLeczkow = myMap.latLngToPixel( 54.380279, 18.620274)
  PmGdaWyzwole = myMap.latLngToPixel( 54.400833, 18.657497)
  PmGdyPorebsk = myMap.latLngToPixel( 54.560836, 18.493331)
  PmGdySzafran = myMap.latLngToPixel( 54.465758, 18.464911)
   ellipse(PmGdaPowWiel.x,PmGdaPowWiel.y,10,10);
   ellipse(PmGdaPowWars.x,PmGdaPowWars.y,10,10);
   ellipse(PmSopBiPlowc.x,PmSopBiPlowc.y,10,10);
   ellipse( PmGdaLeczkow.x, PmGdaLeczkow.y,10,10);
   ellipse( PmGdaWyzwole.x, PmGdaWyzwole.y,10,10);
  ellipse( PmGdyPorebsk.x, PmGdyPorebsk.y,10,10);
  ellipse(  PmGdySzafran.x,  PmGdySzafran.y,10,10);
  

}