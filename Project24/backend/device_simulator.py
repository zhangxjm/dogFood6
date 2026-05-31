import paho.mqtt.client as mqtt
import json
import time
import random
from datetime import datetime
import threading

class DeviceSimulator:
    def __init__(self, device_id, mqtt_host='localhost', mqtt_port=1883):
        self.device_id = device_id
        self.base_topic = f"petfeeder/{device_id}"
        self.client = mqtt.Client()
        self.battery_level = random.uniform(70, 100)
        self.is_running = False
        self.mqtt_host = mqtt_host
        self.mqtt_port = mqtt_port
        
    def on_connect(self, client, userdata, flags, rc):
        print(f"Device {self.device_id} connected with result code {rc}")
        client.subscribe(f"{self.base_topic}/command")
    
    def on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode())
            print(f"Device {self.device_id} received command: {payload}")
            
            action = payload.get('action')
            
            if action == 'feed':
                self.handle_feed(payload)
            elif action == 'reboot':
                self.handle_reboot()
            elif action == 'set_low_power':
                self.handle_low_power(payload)
                
        except Exception as e:
            print(f"Error processing command: {e}")
    
    def handle_feed(self, payload):
        portion = payload.get('portion', 50)
        pet_id = payload.get('pet_id', 1)
        
        success = random.random() > 0.05
        
        response = {
            'device_id': self.device_id,
            'pet_id': pet_id,
            'portion': portion,
            'success': success,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if not success:
            response['error'] = random.choice(['料斗空', '电机故障', '传感器异常'])
        
        self.client.publish(f"{self.base_topic}/feeding", json.dumps(response))
        
        if success:
            self.battery_level -= random.uniform(0.1, 0.5)
            print(f"Device {self.device_id} fed {portion}g to pet {pet_id}")
        else:
            print(f"Device {self.device_id} feeding failed: {response.get('error')}")
    
    def handle_reboot(self):
        print(f"Device {self.device_id} rebooting...")
        time.sleep(2)
        self.battery_level = min(100, self.battery_level + 5)
        print(f"Device {self.device_id} reboot complete")
    
    def handle_low_power(self, payload):
        enabled = payload.get('enabled', False)
        print(f"Device {self.device_id} low power mode set to: {enabled}")
    
    def send_heartbeat(self):
        while self.is_running:
            try:
                self.battery_level = max(0, self.battery_level - random.uniform(0.01, 0.05))
                
                heartbeat = {
                    'device_id': self.device_id,
                    'battery': round(self.battery_level, 2),
                    'signal_strength': random.randint(60, 100),
                    'status': 'online',
                    'low_power_mode': self.battery_level < 20,
                    'timestamp': datetime.utcnow().isoformat()
                }
                
                self.client.publish(f"{self.base_topic}/heartbeat", json.dumps(heartbeat))
                self.client.publish(f"{self.base_topic}/status", json.dumps(heartbeat))
                
                time.sleep(30)
            except Exception as e:
                print(f"Error sending heartbeat: {e}")
                time.sleep(5)
    
    def simulate_random_feeding(self):
        while self.is_running:
            try:
                time.sleep(random.randint(60, 180))
                
                if random.random() < 0.3:
                    portion = random.uniform(20, 80)
                    pet_id = random.choice([1, 2])
                    
                    response = {
                        'device_id': self.device_id,
                        'pet_id': pet_id,
                        'portion': round(portion, 2),
                        'success': True,
                        'timestamp': datetime.utcnow().isoformat()
                    }
                    
                    self.client.publish(f"{self.base_topic}/feeding", json.dumps(response))
                    self.battery_level -= random.uniform(0.1, 0.3)
                    print(f"Device {self.device_id} auto-fed {round(portion, 2)}g to pet {pet_id}")
            except Exception as e:
                print(f"Error in random feeding: {e}")
    
    def start(self):
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        
        try:
            self.client.connect(self.mqtt_host, self.mqtt_port, 60)
        except Exception as e:
            print(f"Connection failed, retrying in 5s: {e}")
            time.sleep(5)
            return self.start()
        
        self.is_running = True
        
        heartbeat_thread = threading.Thread(target=self.send_heartbeat, daemon=True)
        heartbeat_thread.start()
        
        feeding_thread = threading.Thread(target=self.simulate_random_feeding, daemon=True)
        feeding_thread.start()
        
        self.client.loop_forever()
    
    def stop(self):
        self.is_running = False
        self.client.disconnect()

def main():
    import sys
    device_id = sys.argv[1] if len(sys.argv) > 1 else 'device001'
    mqtt_host = sys.argv[2] if len(sys.argv) > 2 else 'localhost'
    
    simulator = DeviceSimulator(device_id, mqtt_host)
    try:
        simulator.start()
    except KeyboardInterrupt:
        simulator.stop()
        print(f"Device {device_id} stopped")

if __name__ == '__main__':
    main()
