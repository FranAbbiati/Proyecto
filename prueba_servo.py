from gpiozero import Servo
from time import sleep

servo = Servo(18)

print("Servo en posicion cerrada")
servo.min()
sleep(2)

print("Servo en posicion media")
servo.mid()
sleep(2)

print("Servo en posicion abierta")
servo.max()
sleep(2)

print("Volviendo a cerrada")
servo.min()
sleep(2)

servo.detach()

print("Prueba terminada")
