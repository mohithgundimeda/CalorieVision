from flask import Flask, render_template,request,jsonify
from sqlalchemy.orm import sessionmaker
from tensorflow.keras.models import load_model
import numpy as np
import base64
import logging
import datetime
from PIL import Image
from io import BytesIO
from database import engine,Diet ,Month,Week,Days,Base


# getting model
model=load_model('models/model_epoch_53.h5')

  
app = Flask(__name__)

app.logger.setLevel(logging.DEBUG)
stream_handler = logging.StreamHandler()
stream_handler.setLevel(logging.DEBUG)
app.logger.addHandler(stream_handler)


@app.route('/')
def index():
    return render_template('signin.html')

@app.route('/processImage_camera',methods=['POST'])
def prediction():
    data=request.json
    image_data=data['image']
    
    img=Image.open(BytesIO(base64.b64decode(image_data.split(',')[1])))
    img = img.convert('RGB')
    img=img.resize((150,150))
    img_array=np.array(img)/255.0
    prediction=model.predict(np.expand_dims(img_array,axis=0))
    classes=['Bread', 'Egg', 'Meat', 'Noodles', 'Rice']
    output=classes[np.argmax(prediction)]
    return jsonify({'prediction': output})
    
@app.route('/processImage_upload',methods=['POST'])
def prediction_upload():
    image_file = request.files['image']
    img = Image.open(image_file)
    img=img.resize((150,150))
    img_array=np.array(img)/255.0
    prediction=model.predict(np.expand_dims(img_array,axis=0))
    classes=['Bread', 'Egg', 'Meat', 'Noodles', 'Rice']
    output=classes[np.argmax(prediction)]
    return jsonify({'prediction': output})
    
@app.route('/addToDatabase', methods=['POST'])
def addToDataBase():
    Session = sessionmaker(bind=engine)
    session=Session()
    data = request.json
    try:
        new_day = Days(Date=datetime.datetime.now(), Time=datetime.datetime.now(), Item=data['item'], Quantity=data['number'], Protein=data['protien'], Measurement=data['units'], Week_Number=1)
        session.add(new_day)
        session.commit()
        session.close()
         
        return jsonify({'message': 'Data inserted into the database'})
    except Exception as e:
        session.rollback()
        session.close()
        return jsonify({'error': str(e)}), 500

@app.route('/getProteinData', methods=['GET'])
def getProteinData():
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        protein_data = [day.protein for day in session.query(Days.protein).all()]
        labels_data = [day.Item for day in session.query(Days.Item).all()]
        print(protein_data)
        session.close()
        sending_data = {'protein': protein_data, 'labels': labels_data}
        return jsonify(sending_data)
    except Exception as e:
        session.close()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

    