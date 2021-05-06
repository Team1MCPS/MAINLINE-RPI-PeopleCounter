from flask import Flask, request, Response
import json 
import people_counter
import threading
import argparse
import sys
import os, random

mutex = threading.Lock()

app = Flask(__name__) 

totalDown = 0
totalUp = 0

DEMO_MODE = False

@app.route('/camdata', methods = ['GET']) 
def postdata(): 
    global totalDown
    global totalUp
    global mutex

    data = dict()
    mutex.acquire()
    if (totalDown == 0 and totalUp == 0):
        mutex.release()
        data['delta'] = '#'
        return json.dumps({"data":data})
    data['delta'] = totalUp - totalDown
    totalDown = 0
    totalUp = 0
    mutex.release()

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
    totalDown, totalUp = people_counter.main(args)
    mutex.release()
    

if __name__ == "__main__":
    app.run(port=5000)