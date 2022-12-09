const STATION_CNT = 7;

const gridSize = 10;
const MIN_OP = 30, MAX_OP = 255;
const MAX_NO2 = 401;
const MAX_CO = 21;
const MAX_PM10 = 201;
const MAX_DIST_SQ = 10000;

let MODE = { NONE : -1, ALL : 0,  NO2 : 1,  CO : 2,  PM10 : 3 };
let currentMode = MODE.NONE;

let buttonALL, buttonNO2, buttonCO, buttonPM10, buttonPLAY, sliderTIME;
let buttons = [];
let button_info = [];

let station_name = ["PmGdaPowWiel", "PmGdaPowWars", "PmSopBiPlowc", "PmGdaLeczkow", "PmGdaWyzwole", "PmGdyPorebsk", "PmGdySzafran"];
let station_id = [ -1, 2, 5, 1, 3, 4, 6];
let station_pos = [];
let station_co = [];
let station_no2 = [];
let station_pm10 = [];

let mapImage;
let mapPos;

let autoPlay;
let timeIndex;

let co_table, no2_table, pm10_table;
let co_columns, no2_columns, pm10_columns;
let co_row_cnt, no2_row_cnt, pm10_row_cnt;
let data_cnt;

let co_path = "2021_CO_1g.csv"
let no2_path = "2021_NO2_1g.csv"
let pm10_path = "2021_PM10_1g.csv"

let PmGdaPowWiel;
let PmGdaPowWars;
let PmSopBiPlowc;
let PmGdaLeczkow;
let PmGdaWyzwole;
let PmGdyPorebsk;
let PmGdySzafran;

let last_inc_timestamp_ms = 0;
let inc_interval_ms = 20;

// let no2_data = [];
// let co_data = [];
// let pm10_data = [];

function preload() 
{
  co_table = loadTable('data/' + co_path, 'csv', 'header');
  no2_table = loadTable('data/' + no2_path, 'csv', 'header');
  pm10_table = loadTable('data/' + pm10_path, 'csv', 'header');
}

function setup() 
{
  mapImage = loadImage('data/map.png');

  // for (let xx = 0; xx < mapImage.width/gridSize; xx++) 
  // {
  //   no2_data[xx] = []; 
  //   co_data[xx] = []; 
  //   pm10_data[xx] = []; 
  //   for (let yy = 0; yy < mapImage.height/gridSize; yy++) 
  //   {
  //     no2_data[xx][y]y = 0.0;
  //     co_data[xx][yy] = 0.0; 
  //     pm10_data[xx][yy] = 0.0; 
  //   }
  // }
 
  co_columns = co_table.getColumnCount();
  no2_columns = no2_table.getColumnCount();
  pm10_columns = pm10_table.getColumnCount();

  co_row_cnt = co_table.getRowCount();
  no2_row_cnt = no2_table.getRowCount();
  pm10_row_cnt = pm10_table.getRowCount();
  data_cnt = co_row_cnt - 5;
  
  createCanvas(windowWidth, windowHeight);

  X_OFFSET = width / 6;
  Y_OFFSET = height / 14;

  // mapImage.resize(4*X_OFFSET, 0); doesn't work for some reason 

  mapPos = createVector(0, Y_OFFSET);

  station_pos = 
  [
    createVector(372 + mapPos.x, 430 + mapPos.y),
    createVector(401 + mapPos.x, 536 + mapPos.y),
    createVector(324 + mapPos.x, 345 + mapPos.y),
    createVector(381 + mapPos.x, 473 + mapPos.y),
    createVector(431 + mapPos.x, 424 + mapPos.y),
    createVector(207 + mapPos.x, 48 + mapPos.y),
    createVector(168 + mapPos.x, 272 + mapPos.y)
  ];

  station_co = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
  station_no2 = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];
  station_pm10 = [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ];

  buttons = 
  [
    createButton(''),
    createButton(''),
    createButton(''),
    createButton(''),
    createButton(''),
    createButton(''),
    createButton(''),
  ];

  for(let i = 0; i < 7; i++)
  {
    buttons[i].position(station_pos[i].x - 10, station_pos[i].y - 10);
    buttons[i].mouseOver(function()  {button_over(station_name[i], buttons[i].position(), station_no2[i], station_co[i], station_pm10[i]);});
    buttons[i].mouseOut(button_out);
    buttons[i].size(20, 20);
    buttons[i].style('background', 'none');
    buttons[i].style('border', 'none');
  }

  timeIndex = 0;
  autoPlay = false;

  /* GUI */
  sliderTIME = createSlider(0, data_cnt - 1 , 0);
  sliderTIME.position(width - 3.5*X_OFFSET, 2*Y_OFFSET);
  sliderTIME.size(3*X_OFFSET, Y_OFFSET);

  buttonPLAY = createButton('START');
  buttonPLAY.position(width - 3.5*X_OFFSET, 3*Y_OFFSET)
  buttonPLAY.mousePressed(toggleAutoPlay);
  buttonPLAY.size(X_OFFSET/2, Y_OFFSET/2);

  buttonALL = createButton('ALL');
  buttonALL.position(0, 0);
  buttonALL.mousePressed(function() { setMode(MODE.ALL); });
  buttonALL.size(X_OFFSET, Y_OFFSET);
  //buttonAll.textSize
  
  buttonNO2 = createButton('NO2');
  buttonNO2.position(X_OFFSET, 0);
  buttonNO2.mousePressed(function() { setMode(MODE.NO2); });
  buttonNO2.size(X_OFFSET, Y_OFFSET);

  buttonCO = createButton('CO');
  buttonCO.position(2*X_OFFSET, 0);
  buttonCO.mousePressed(function() { setMode(MODE.CO); });
  buttonCO.size(X_OFFSET, Y_OFFSET);

  buttonPM10 = createButton('PM10');
  buttonPM10.position(3*X_OFFSET, 0);
  buttonPM10.mousePressed(function() { setMode(MODE.PM10); });
  buttonPM10.size(X_OFFSET, Y_OFFSET);

  buttonRESET = createButton('RESET');
  buttonRESET.position(4*X_OFFSET, 0);
  buttonRESET.size(2*X_OFFSET, Y_OFFSET);
  buttonRESET.mousePressed(function() { setMode(MODE.NONE); });
}

function draw() 
{
  background(0);
  

  drawMap();
  drawInterface();

  updateData();
  drawData();

  drawInfo();
}

function setMode(mode) 
{
  currentMode = mode;

  if(currentMode == MODE.NONE)
  {
    timeIndex = 0;
    sliderTIME.value(0);
    buttonPLAY.html('START');
    autoPlay = false;
  }
}

function toggleAutoPlay()
{
  autoPlay = !autoPlay;
  if(autoPlay)
  {
    buttonPLAY.html('STOP');
  }
  else
  {
    buttonPLAY.html('START');
  }
}

function drawMap()
{
  /* Everything relative to the map position */
  push();
  translate(mapPos.x, mapPos.y);
  image(mapImage, 0, 0); 
  translate(-mapPos.x, -mapPos.y);
  pop();
}

function drawInterface() 
{
  fill(255);
  textSize(Y_OFFSET);
  text("Date: " + co_read_row(timeIndex)[0], width - 3.5*X_OFFSET, 2*Y_OFFSET);
  
  if(mouseX > mapPos.x && mouseX < mapPos.x + mapImage.width && mouseY > mapPos.y && mouseY < mapPos.y + mapImage.height)
  {
    textSize(Y_OFFSET/3);
    text("Location: " + nf(lat(mouseX),2,2) + "N, " + nf(long(mouseY),3,2) + "E", width - 3.5*X_OFFSET, 5*Y_OFFSET)
    text("NO2    : " /* + no2_data[mouseX/gridSize][mouseY/gridSize] */+ " μg/m3", width - 3.5*X_OFFSET, 5.5*Y_OFFSET);
    text("CO     : " /* + co_data[mouseX/gridSize][mouseY/gridSize] */ + " μg/m3", width - 3.5*X_OFFSET, 6*Y_OFFSET);
    text("PM10 : " /*+ pm10_data[mouseX/gridSize][mouseY/gridSize] */+ " μg/m3", width - 3.5*X_OFFSET, 6.5*Y_OFFSET);
  }

  textSize(Y_OFFSET/5);
  text("DEBUG: ", width - X_OFFSET, height - 3.5*Y_OFFSET);
  text("Data count = " + str(data_cnt), width - X_OFFSET, height - 2.5*Y_OFFSET);
  text("Time index = " + str(timeIndex), width - X_OFFSET, height - 2*Y_OFFSET);
  text("x_map = " + str(int(mouseX - mapPos.x)) + ", y_map = " + str(int(mouseY - mapPos.y)) + "", width - X_OFFSET, height - 1.5*Y_OFFSET);
  text("MODE = " + str(currentMode), width - X_OFFSET, height - Y_OFFSET);
  text("x = " + str(int(mouseX)) + ", y = " + str(int(mouseY)) + "", width - X_OFFSET, height - 0.5*Y_OFFSET);
}

function lat(mx)
{
  // TODO correct calculation from pixel to latitude
  return 54 + (mx + mapPos.x) / 200;
}

function long(my)
{
  // TODO correct calculation from pixel to longitude
  return 18 + ( my + mapPos.y) / 200;
}

function updateData()
{
  if(autoPlay)
  {
    if(millis() - last_inc_timestamp_ms > inc_interval_ms)
    {
      timeIndex++;
      sliderTIME.value(timeIndex);
      last_inc_timestamp_ms = millis();
    }
  }
  else
  {
    timeIndex = sliderTIME.value();
  }

  pm10_data = pm10_read_row(timeIndex);
  co_data = co_read_row(timeIndex);
  no2_data = no2_read_row(timeIndex);

  for(let i = 0; i < STATION_CNT; i++)
  {
    if(station_id[i] > 0)
    {
      station_co[i] = co_data[station_id[i]];
      station_no2 [i] = no2_data[station_id[i]];
      station_pm10[i] = pm10_data[station_id[i]];
    }
  }
}

// TODO 
// fix interpolation (this one probably doesn't work)
function drawData()
{
  noStroke();
  let no2_op = 0, co_op = 0, pm10_op = 0, px = 0, py = 0;
  let pvec = createVector(px, py);
  let dist_sq = 0;
  let sum_dist = 0;
  let sum_no2 = 0, sum_co = 0, sum_pm10 = 0;

  for(let x = 0; x < mapImage.width / gridSize; x++)
  {
    for(let y = 0; y < mapImage.height / gridSize; y++)
    {   
      px = x * gridSize + mapPos.x;
      py = y * gridSize + mapPos.y;
      pvec.set(px, py);

      sum_no2 = 0;
      sum_co = 0; 
      sum_pm10 = 0;
      sum_dist = 0;
      no2_op = 0;
      co_op = 0;
      pm10_op = 0;
      
      /* Start from 1 to ignore PowWiel - no Data */
      for(let i = 1; i < STATION_CNT; i++) 
      {
        dist_sq = distSq(station_pos[i], pvec);

        if(dist_sq < MAX_DIST_SQ)
        {
          sum_no2 += dist_sq * station_no2[i];
          sum_co += dist_sq * station_co[i];
          sum_pm10 += dist_sq * station_pm10[i];
          sum_dist += dist_sq;   
        }
      }

      if(sum_no2 > 0)
      {
        sum_no2 /= sum_dist;
        no2_op = map(sum_no2, 0, MAX_NO2, MIN_OP, MAX_OP);
        no2_op = constrain(no2_op, MIN_OP, MAX_OP);
      }
 
      if(sum_co > 0)
      {
        sum_co /= sum_dist;
        co_op = map(sum_co, 0, MAX_CO, MIN_OP, MAX_OP);
        co_op = constrain(co_op, MIN_OP, MAX_OP);
      }
      
      if(sum_pm10 > 0)
      {
        sum_pm10 /= sum_dist;
        pm10_op = map(sum_pm10, 0, MAX_PM10, MIN_OP, MAX_OP);
        pm10_op = constrain(pm10_op, MIN_OP, MAX_OP);
      }

      avg_op = no2_op + co_op + pm10_op;

      // no2_data[x][y] = sum_no2;
      // co_data[x][y] = sum_co;
      // pm10_data[x][y] = sum_pm10;

      switch(currentMode)
      {
        case MODE.NONE:
          break;

        case MODE.ALL:
          // AVG
          fill(200, avg_op);
          ellipse(px  + gridSize/2, py  + gridSize/2, gridSize/2, gridSize/2);
          break;
  
        case MODE.NO2:
          // NO2
          fill(255,0,0, no2_op);
          ellipse(px, py, gridSize/2, gridSize/2);
          break;
    
        case MODE.CO:
          // CO
          fill(0,0,255, co_op);
          ellipse(px + gridSize/2, py, gridSize/2, gridSize/2);
          break;
    
        case MODE.PM10:
          // PM10
          fill(0,255,0, pm10_op);
          ellipse(px, py + gridSize/2, gridSize/2, gridSize/2);
          break;

        default:
          break;
      }
    } 
  }
}

function distSq(p1, p2)
{
  return int((p1.x - p2.x)*(p1.x - p2.x) + (p1.y - p2.y)*(p1.y - p2.y));
}

function button_over(name_id, button_position, meas_no2, meas_co, meas_pm10)
{
  button_info[0] = true;
  button_info[1] = name_id;
  button_info[2] = button_position;
  button_info[3] = meas_no2;
  button_info[4] = meas_co; 
  button_info[5] = meas_pm10; 
}

function button_out()
{
  button_info[0] = false;
}

function drawInfo()
{
  print(button_info);
  if(button_info[0])
  {
    fill(255);
    rect(button_info[2].x + 20, button_info[2].y, 98, 56);
    fill(0);
    textSize(12);  
    textStyle(BOLDITALIC);
    text(button_info[1], button_info[2].x + 22, button_info[2].y + 15);
    textStyle(NORMAL);
    text("NO2   = " + nf(button_info[3], 0, 2), button_info[2].x + 22, button_info[2].y + 30);
    text("CO     = " + nf(button_info[4], 0, 2), button_info[2].x + 22, button_info[2].y + 41);
    text("PM10 = " + nf(button_info[5], 0, 2), button_info[2].x + 22, button_info[2].y + 51);
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

function co_read_row(row)
{
  row += 5;
  co_row = [];
  co_row[0] = co_table.getString(row,0);
  co_row[1] = co_table.getString(row,38);
  co_row[2] = co_table.getString(row,39);
  co_row[3] = co_table.getString(row,40);
  co_row[4] = co_table.getString(row,41);
  co_row[5] = co_table.getString(row,44);
  co_row[6] = 0;
  /*
  for(let i=0; i<co_columns; i++){
    co_row[i] = co_table.getString(row,i);
  }*/
  return co_row;
}

function no2_read_row(row)
{
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

function pm10_read_row(row)
{
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

