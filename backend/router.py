from flask import Flask, request
from src.Graph import Graph
import json
from werkzeug.wrappers import Response, Request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

global graph
graph = Graph('./data/all.json')

@app.route('/getTSNE')
def getTSNE():
    global graph
    # graph = Graph('./data/all.json')
    result = graph.getDimension()
    return Response(json.dumps(result), content_type="application/json")

@app.route('/getLayout')
def getLayout():
    global graph
    result = graph.getLayout()
    return Response(json.dumps(result), content_type="application/json")

@app.route('/getAll')
def getAll():
    global graph
    result = graph.getAll()
    return Response(json.dumps(result), content_type="application/json")

@app.route('/getUpdate', methods=['GET', 'POST'])
def getUpdate():
    # print(request.form)
    data = json.loads(request.get_data())
    # print(data['choose'])
    result = graph.getLayout(data['choose'])
    return Response(json.dumps(result), content_type="application/json")


if __name__ == '__main__':
    # app.run(debug=True)
    app.run()