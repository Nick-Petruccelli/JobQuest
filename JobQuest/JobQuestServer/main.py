from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "home"

@app.route('/create-user', methods=['POST'])
def create_user():
    print("hit")
    user_data = request.get_json()
    print(user_data)
    with open('data/userData.json', '+r') as file:
        file_data = json.load(file)
        file_data[user_data['username']] = user_data
        file.seek(0)
        json.dump(file_data, file, indent = 4)
    
    return jsonify(user_data), 201

@app.route('/get-user/<username>')
def get_user(username):
    with open('data/userData.json', 'r') as file:
        file_data = json.load(file)
        user_data = file_data[username]
        if user_data == None:
            return username, 400
        return jsonify(user_data), 200


@app.route('/save-quiz/<username>', methods=['POST'])
def save_quiz(username):
    print("saving")
    quiz_data = request.get_json()
    with open('data/userData.json', '+r') as file:
        file_data = json.load(file)
        if file_data[username] == None:
            return jsonify(quiz_data), 400
        file_data[username]['quizResults'].append(quiz_data)
        file.seek(0)
        json.dump(file_data, file, indent = 4)
    
    return jsonify(quiz_data), 201

if __name__ == "__main__":
    app.run(debug=True)