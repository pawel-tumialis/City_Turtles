import pandas as pd
import plotly.express as px
import os
import numpy as np

# ------------defines
path_to_data = "my_database"
data_name = "all.csv"

class_dick_str = {}
class_dick_val = {}

point_top_left = [54.472069, 18.368674]
point_down_rigth = [54.275297, 18.939957]
x_number = 200
y_number = 140

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
    points['color'] = 1
    points['wage'] = [class_dick_val[points.type[i]] for i in range(len(points))]

    color_scale = [(0, 'green'), (1, 'red')]

    fig = px.scatter_mapbox(points,
                            lat="lat",
                            lon="lon",
                            hover_name="title",
                            # hover_data=["title", "size"],
                            # color_continuous_scale=px.colors.sequential.Plasma,
                            color='type',
                            size="size",
                            text='wage',
                            zoom=10,
                            height=800,
                            width=1200)

    return fig

def add_wage_to_matrix(wage_matrix, point, squere_x, squere_y):
    x = int((point_top_left[0] - point['lat'])/squere_x)
    y = int((point_down_rigth[1] - point['lon'])/squere_y)
    #print("X w tablicy {}".format(x))
    #print("Y w tablicy {}".format(y))
    wage_matrix[x][y] += 1 #point['wage']
    return 1


if __name__ == "__main__":

    # prepare classes and subclasses lists 
    my_classes = os.listdir(path_to_data)
    my_subclasses = [[str.split('_')[0] for str in os.listdir(path_to_data + "/" + my_classes[i])] for i in range(len(my_classes))] 
    for i in range(len(my_classes)): 
        class_dick_str.update(dict.fromkeys(my_subclasses[i], my_classes[i]))

    # get weights from user
    for i in range(len(my_classes)):
        while True:
            try:
                w = int(input("Prosze podac wartosc wagi od 1 do 10 dla " + my_classes[i] + ": "))
                if(w <= 10 and w >= 0):
                    class_dick_val.update(dict.fromkeys(my_subclasses[i], w))
                    break
            except:
                print("Nie ten typ/wartosc")

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
    
    # create matrix
    wage_matrix = np.zeros((x_number, y_number))
    squere_x = (point_top_left[0] - point_down_rigth[0])/x_number
    squere_y = (point_down_rigth[1] - point_top_left[1])/y_number
    
    # open csv and print points on map
    all_places = pd.DataFrame()
    df = pd.read_csv(data_name, index_col=False)
    frames = [all_places, df]
    all_places = pd.concat(frames)
    placesMap = setPlaces(all_places)
    showMap(placesMap)
    
    for i in range(len(all_places)):
        add_wage_to_matrix(wage_matrix, all_places.iloc[i], squere_x, squere_y)
    #print matrix
        '''
    with np.printoptions(threshold=np.inf):
        print(wage_matrix) '''