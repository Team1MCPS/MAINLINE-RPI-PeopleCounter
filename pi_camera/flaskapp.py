from flask import Flask, request, Response
import json 
import people_counter
import threading
import argparse
import sys
import os, random

mutex = threading.Lock()

app = Flask(__name__) 

totalDown = '#'
totalUp = '#'

DEMO_MODE = False

@app.route('/camdata', methods = ['GET']) 
def postdata(): 
    global totalDown
    global totalUp
    global mutex

    data = dict()
    if mutex.locked() == False:
    	mutex.acquire()
    	if (totalDown == '#' and totalUp == '#'):
            mutex.release()
            data['delta'] = '#'
	else:
    	    data['delta'] = totalUp - totalDown
    	    # Resetting
       	    totalDown = '#'
    	    totalUp = '#'
    	    mutex.release()
    else:
	data['delta'] = '#'
    return json.dumps({"data":data}) 
   
@app.route('/opencamera', methods = ['GET']) 
def opencamera():
    thread = threading.Thread(target=openCameraThread)
    thread.start()

    resp = Response(status=200)

    return resp


def openCameraThread():
    global totalDown
    global totalUp
    global mutex

    args = dict()

    if "demo" in sys.argv:
        video = random.choice(os.listdir("videos/"))
        print("[INFO] video selected "+video)
        args['input'] = 'videos/'+video
        
    args['confidence'] = 0.4
    args['skip_frames'] = 30

    mutex.acquire()
    totalDown = 0
    totalUp = 0
    totalDown, totalUp = people_counter.main(args)
    mutex.release()
    

if __name__ == "__main__":
    app.run(port=5000)
