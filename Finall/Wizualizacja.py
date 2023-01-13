import pandas as pd
import plotly.express as px
import os
import numpy as np

# ------------defines
path_to_data = "my_database"
data_name = "all.csv"

class_dick_str = {}
class_dick_val = {}
class_dick_index = {}

class_presence_matrix = {}

point_top_left = [54.472069, 18.368674]
point_down_rigth = [54.275297, 18.939957]
x_number = 100
y_number = 100
friendly_distance = 5
best_points_number = 200

def showMap(fig):
    """
    This function is responsible for opening the map in the browser. The HTML file is saved with specified name.
    :param fig:
    :return:
    """
    fig.update_layout(mapbox_style="open-street-map")
    fig.update_layout(margin={"r": 0, "t": 0, "l": 0, "b": 0})

    # open the browser
    fig.show()

    # save the page as an HTML file
    htmlSavingDirectory = 'savedVisualisations/'
    htmlFilename = "measure_points_visualisation_v1"
    fig.write_html(htmlSavingDirectory + htmlFilename + ".html")


def setPlaces(points):
    """
    This function is responsible for visualisation of points on the map.
    :param points: DataFrame containing information about the points to visualise.
    :return: figure of type scatter_mapbox (from plotly.express library)
    """
    points['size'] = 100
    points['color'] = [str(class_dick_val[points.type[i]]) for i in range(len(points))]
    points['wage'] = [str(class_dick_val[points.type[i]]) for i in range(len(points))]

    color_scale = [(0, 'green'), (1, 'red')]

    fig = px.scatter_mapbox(points,
                            lat="lat",
                            lon="lon",
                            hover_name="title",
                            color= "type",
                            size="size",
                            text='wage',
                            zoom=10,
                            height=800,
                            width=1200)

    return fig

def add_wage_to_matrix(wage_matrix, point, squere_x, squere_y):

    x = int((point_top_left[0] - point['lat'])/squere_x)
    y = int((point_down_rigth[1] - point['lon'])/squere_y)
    dx = 0
    dy = 0
    amp = 0
    div = 1
    for yy in range(2*friendly_distance):
        for xx in range(2*friendly_distance):
            dx = xx - friendly_distance
            dy = yy - friendly_distance
            amp = 2*friendly_distance + 1 - (abs(dx) + abs(dy))
            if x + dx < x_number and y + dy < y_number:
                
                class_presence_matrix[class_dick_index[point['type']]][x + dx][y + dy] += 1
                div = 2 * class_presence_matrix[class_dick_index[point['type']]][x + dx][y + dy] 
                wage_matrix[x + dx][y + dy] += amp*class_dick_val[point['type']] / div
    return 1


if __name__ == "__main__":

    # prepare classes and subclasses lists 
    my_classes = os.listdir(path_to_data)
    my_subclasses = [[str.split('_')[0] for str in os.listdir(path_to_data + "/" + my_classes[i])] for i in range(len(my_classes))] 
    for i in range(len(my_classes)): 
        class_dick_str.update(dict.fromkeys(my_subclasses[i], my_classes[i]))
        class_dick_index.update(dict.fromkeys(my_subclasses[i], i))

     # get weights from user
    stop = False
    for i in range(len(my_classes)):
        while True:
            try:
                c = input("Prosze podac wartosc wagi od 1 do 10 dla " + my_classes[i] + ": ")
                if(c == "e" or c == "E"):
                    print('E key pressed - exiting program.')
                    stop = True
                    break
                else:
                    w = int(c)
                    if(w <= 10 and w >= 0):
                        class_dick_val.update(dict.fromkeys(my_subclasses[i], w))
                        break 
            except:
                print("Nie ten typ/wartosc")
        
        if stop:
            exit()
    # save all .csv files to one .csv       
    all = pd.DataFrame()

    for dir in os.listdir(path_to_data):
        for file in os.listdir(path_to_data + "/" + dir):
            ds = pd.read_csv(path_to_data + "/" + dir + "/" + file)
            all = pd.concat([all, ds], axis = 0)

    del all['link']

    all = all.drop(all.iloc[all['lat'].values > point_top_left[0]].index.tolist(),axis=0)
    all.reset_index()
    all = all.drop(all.iloc[all['lat'].values < point_down_rigth[0]].index.tolist(),axis=0)
    all.reset_index()

    all = all.drop(all.iloc[all['lon'].values > point_down_rigth[1]].index.tolist(),axis=0)
    all.reset_index()
    all = all.drop(all.iloc[all['lon'].values < point_top_left[1]].index.tolist(),axis=0)
    all.reset_index()
    all.to_csv(data_name, index = False)
    
    # create matrices - one for wages and one for presence 
    class_presence_matrix = [np.zeros((x_number, y_number)) for cl in my_classes]

    wage_matrix = np.zeros((x_number, y_number))
    squere_x = (point_top_left[0] - point_down_rigth[0])/x_number
    squere_y = (point_down_rigth[1] - point_top_left[1])/y_number
    
    # open csv and print points on map
    all_places = pd.DataFrame()
    df = pd.read_csv(data_name, index_col=False)
    frames = [all_places, df]
    all_places = pd.concat(frames)
    placesMap = setPlaces(all_places)
    
    for i in range(len(all_places)):
        add_wage_to_matrix(wage_matrix, all_places.iloc[i], squere_x, squere_y)
    # print matrix
        '''
    with np.printoptions(threshold=np.inf):
        print(wage_matrix) '''
        
    # finding best points
    best_points = np.zeros((best_points_number, 3))
    for i in range(x_number):
        for j in range(y_number):
            k = best_points_number - 1
            while(wage_matrix[i][j] > best_points[k][0] and k >= 0):
                if k < best_points_number - 1:
                    best_points[k+1][0] = best_points[k][0]
                    best_points[k+1][1] = best_points[k][1]
                    best_points[k+1][2] = best_points[k][2]

                best_points[k][0] = wage_matrix[i][j]
                best_points[k][1] = i
                best_points[k][2] = j    
                k -= 1

    best_point_value = best_points[0][0]
    best_points_frame = pd.DataFrame(columns=['lat', 'lon', 'wage', 'name', 'color'])
    for i in range(best_points_number):
        ind = best_points_number-i-1
        best_points_frame.loc[i] = {'lat':(point_top_left[0] - best_points[ind][1]*squere_x+squere_x/2), 'lon':(point_down_rigth[1] - best_points[ind][2]*squere_y+squere_y/2), 'wage':best_points[i][0], 'name':"Najlepsze miejsce: {}".format(best_points[ind][0]),
        'color':('rgb('+str(255*(best_point_value - best_points[ind][0])/best_point_value) + ','+str(255*(best_point_value - best_points[ind][0])/best_point_value) +',' +str(255*(best_point_value - best_points[ind][0])/best_point_value) +')')}
    
    placesMap.add_scattermapbox(
                                lat = best_points_frame['lat'],
                                lon = best_points_frame['lon'],
                                hoverinfo = 'lat + lon + text',
                                text=best_points_frame['name'],
                                marker_size = 30,
                                opacity = 0.8,
                                name = "Najlepsze miejsce",
                                marker_color =  best_points_frame['color'],
                                showlegend = True)
    showMap(placesMap)
                        
        
    
