let mapImage, beastImage;

let button_strings = [ "ALL", "NO2", "CO2", "COS" ];
let modes = { IDLE : -1, ALL : 0,  NO2 : 1,  CO2 : 2,  COS : 3 };
let option = -1;

let X_OFFSET, Y_OFFSET;
let color_change_interval_ms = 500;
let last_color_change_timestamp_ms = 0;

// Vectors 
let opt_pos, opt_vel;
let beast_pos, beast_vel;
let alpha;
// Color
let col;

let co2_table;
let no2_table;
let pm10_table;
var co2_path = "2021_CO_1g.csv"
var no2_path = "2021_NO2_1g.csv"
var pm10_path = "2021_PM10_1g.csv"

function preload() {
  co2_table = loadTable('data/' + co2_path, 'csv', 'header');
  no2_table = loadTable('data/' + no2_path, 'csv', 'header');
  pm10_table = loadTable('data/' + pm10_path, 'csv', 'header');
}

function setup() 
{
  co2_columns = co2_table.getColumnCount();
  no2_columns = no2_table.getColumnCount();
  pm10_columns = pm10_table.getColumnCount();
  
  mapImage = loadImage('data/map.png');
  beastImage = loadImage('data/Papieżółw - Bestia z Wadowic.png');
  
  beastImage.resize(250, 280);

  createCanvas(600, 600);

  X_OFFSET = width / 4;
  Y_OFFSET = height / 12;
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  
  opt_pos = createVector(40, 50);
  opt_vel = createVector(10, 10);
  opt_pos.x = width / 2;
  opt_pos.y = height / 2;
  col = color(0,0,255);

  beast_pos = createVector(0, 0);
  beast_vel = createVector(10, 10);

  alpha = 0.5;
}

function draw() 
{
  background(0);
  image(mapImage, width/2, height/2);

  drawInterface();

  updateBeast();
  drawBeast();

  updateData();
  drawData();
}

function mouseReleased()
{
  if(mouseY < Y_OFFSET)
  {
    option = int(mouseX / X_OFFSET);
  }
  else
  {
    option = -1;
  }
}

function updateData()
{
  // random acceleration
  opt_vel.add(createVector((random(2) - 1), (random(2) - 1)));   
  opt_vel.x = constrain(opt_vel.x, -20, 20);
  opt_vel.y = constrain(opt_vel.y, -20, 20);

  opt_pos.add(opt_vel);
  opt_pos.x = constrain(opt_pos.x, 0, width);
  opt_pos.y = constrain(opt_pos.y, Y_OFFSET, height);

  // bouncing 
  if(opt_pos.x <= 0 || opt_pos.x >= width)
  {
    opt_vel.x *= -1;
  }

  if(opt_pos.y <= Y_OFFSET || opt_pos.y >= height)
  {
    opt_vel.y *= -1;
  }

  // change color of letters every 500 milliseconds 
  if(millis() - last_color_change_timestamp_ms > color_change_interval_ms)
  {
    col = color(random(255), random(255), random(255));
    last_color_change_timestamp_ms = millis();
  }
}

function drawData()
{
  textSize(Y_OFFSET);
  text(str(option), opt_pos.x, opt_pos.y);
}

function updateBeast()
{
  // random acceleration
  beast_vel.add(createVector((random(2) - 1), (random(2) - 1)));   
  beast_vel.x = constrain(beast_vel.x, -20, 20);
  beast_vel.y = constrain(beast_vel.y, -20, 20);

  beast_pos.add(beast_vel);
  beast_pos.x = constrain(beast_pos.x, 0, width);
  beast_pos.y = constrain(beast_pos.y, Y_OFFSET, height);

  // bouncing 
  if(beast_pos.x <= 0 || beast_pos.x >= width)
  {
    beast_vel.x *= -1;
  }

  if(beast_pos.y <= Y_OFFSET || beast_pos.y >= height)
  {
    beast_vel.y *= -1;
  }

  alpha += 0.06;
}

function drawBeast()
{
  // Relative drawing 
  push();
  translate(beast_pos.x, beast_pos.y);
  rotate(alpha);
  image(beastImage, 0, 0);
  translate(-beast_pos.x, -beast_pos.y);
  pop();
}

function drawInterface()
{
  stroke(0);
  
  for(let i = 0; i < 4; i++)
  {
    if(mouseX > i*X_OFFSET && mouseX < X_OFFSET + i*X_OFFSET && mouseY < Y_OFFSET)
    {
      strokeWeight(5);
      fill(110);
    }
    else
    {
      strokeWeight(3);
      fill(80);
    }

    rect(X_OFFSET/2 + i*X_OFFSET, Y_OFFSET/2 + 1, X_OFFSET, Y_OFFSET);     
  }

  fill(col);
  strokeWeight(1);

  textSize(Y_OFFSET/3);
  for(let i = 0; i < 4; i++)
  {
      text(button_strings[i], X_OFFSET/2 + i*X_OFFSET, Y_OFFSET/2);
  }
}

/* -------------array outputs--------
0 date and hour
1 PmGdaLeczkow
2 PmGdaPowWars
3 PmGdaWyzwole
4 PmGdyPorebsk
5 PmSopBiPlowc
6 PmGdySzafran

  PmGdaPowWiel- I can't find it in Excels
*/

let co2_columns;
function co2_read_row(row){
  row += 5;
  co2_row = [];
  co2_row[0] = co2_table.getString(row,0);
  co2_row[1] = co2_table.getString(row,38);
  co2_row[2] = co2_table.getString(row,39);
  co2_row[3] = co2_table.getString(row,40);
  co2_row[4] = co2_table.getString(row,41);
  co2_row[5] = co2_table.getString(row,44);
  co2_row[6] = 0;
  /*
  for(let i=0; i<co2_columns; i++){
    co2_row[i] = co2_table.getString(row,i);
  }*/
  return co2_row;
}

let no2_columns;
function no2_read_row(row){
  row += 5;
  no2_row = [];
  no2_row[0] = no2_table.getString(row,0);
  no2_row[1] = no2_table.getString(row,89);
  no2_row[2] = no2_table.getString(row,90);
  no2_row[3] = no2_table.getString(row,91);
  no2_row[4] = no2_table.getString(row,92);
  no2_row[5] = no2_table.getString(row,96);
  no2_row[6] = no2_table.getString(row,93);
  /*
  for(let i=0; i<no2_columns; i++){
    no2_row[i] = no2_table.getString(row,i);
  }*/
  return no2_row;
}

let pm10_columns;
function pm10_read_row(row){
  row += 5;
  pm10_row = [];
  pm10_row[0] = pm10_table.getString(row,0);
  pm10_row[1] = pm10_table.getString(row,114);
  pm10_row[2] = pm10_table.getString(row,115);
  pm10_row[3] = pm10_table.getString(row,116);
  pm10_row[4] = pm10_table.getString(row,117);
  pm10_row[5] = pm10_table.getString(row,122);
  pm10_row[6] = pm10_table.getString(row,118);
  /*
  for(let i=0; i<pm10_columns; i++){
    pm10_row[i] = pm10_table.getString(row,i);
  }*/
  return pm10_row;
}
