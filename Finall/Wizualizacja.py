import pandas as pd
import plotly.express as px
import os
import numpy as np

# ------------defines
path_to_data = "data/"
point_top_left = [54.444940, 18.435273]
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
    points['size'] = 1000
    points['color'] = 1
    points['wage'] = "{}".format(5)

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
    wage_matrix[x][y] += point['wage']
    return 1

if __name__ == "__main__":

     # -----------code
     #create matrix
    wage_matrix = np.zeros((x_number, y_number))
    squere_x= (point_top_left[0] - point_down_rigth[0])/x_number
    squere_y= (point_down_rigth[1] - point_top_left[1])/y_number
    
    #open csv and print points on map
    all_places = pd.DataFrame()
    df = pd.read_csv(path_to_data + "apteka.csv", index_col=False)
    frames = [all_places, df]
    all_places = pd.concat(frames)
    #placesMap = setPlaces(all_places)
    #showMap(placesMap)
    
    #add_wage_to_matrix(wage_matrix, all_places.iloc[58], squere_x, squere_y)