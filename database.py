from sqlalchemy import create_engine, Column,ForeignKey,String,Integer,DateTime,Float
from sqlalchemy.orm import sessionmaker,relationship
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base=declarative_base()
db='sqlite:///calorie_vision.db'
engine=create_engine(db)


##class for diet plan
class Diet(Base):
    __tablename__='Diet'
    ID=Column(Integer,primary_key=True)
    Item=Column(String)
    Quantity=Column(Float)
    Intakes=Column(Integer)
    Total_protien=Column(Float)
    def __init__(self,Item,Quantity,Intakes,Total_protien):
        self.Item=Item
        self.Quantity=Quantity
        self.Intakes=Intakes
        self.Total_protien=Total_protien
        
        
##class for monthly data
class Month(Base):
    __tablename__ = 'Month'
    Month_Number = Column(Integer, primary_key=True)
    Year = Column(Integer)
    Total_Protein = Column(Float)
    weeks = relationship('Week', back_populates='month')

    def __init__(self, Month_Number, Year, Total_Protein):
        self.Month_Number = Month_Number
        self.Year = Year
        self.Total_Protein = Total_Protein
        
        
##class for weekly data
class Week(Base):
    __tablename__ = 'Week'
    Week_Number = Column(Integer, primary_key=True)
    Month_Number = Column(Integer, ForeignKey('Month.Month_Number'))
    Total_Protein = Column(Float)
    days = relationship('Days', back_populates='week')
    month = relationship('Month', back_populates='weeks')

    def __init__(self, Week_Number, Month_Number, Total_Protein):
        self.Week_Number = Week_Number
        self.Month_Number = Month_Number
        self.Total_Protein = Total_Protein
        
##class for daily data
class Days(Base):
    __tablename__ = 'Days'
    Id = Column(Integer, primary_key=True)
    Date = Column(DateTime)
    Time = Column(DateTime)
    Item = Column(String)
    Quantity = Column(Float)
    Protein = Column(Float)
    Measurement = Column(String)
    Week_Number = Column(Integer, ForeignKey('Week.Week_Number'))
    week = relationship('Week', back_populates='days')

    def __init__(self, Date, Time, Item, Quantity, Protein, Measurement,Week_Number):
        self.Date = Date
        self.Time = Time
        self.Item = Item
        self.Quantity = Quantity
        self.Protein = Protein
        self.Week_Number=Week_Number
        self.Measurement = Measurement

        


