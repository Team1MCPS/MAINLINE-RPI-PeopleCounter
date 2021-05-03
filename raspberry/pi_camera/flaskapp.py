from flask import Flask, request, Response
import json 
import people_counter
import threading
import argparse

mutex = threading.Lock()

app = Flask(__name__) 

totalDown = 0
totalUp = 0

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
    args['input'] = 'videos/test_frame_ridotto.mp4'
    args['confidence'] = 0.4
    args['skip_frames'] = 30

    mutex.acquire()
    totalDown, totalUp = people_counter.main(args)
    mutex.release()
    

if __name__ == "__main__":
    app.run(port=5000)
	
    
    
    
	
	

    