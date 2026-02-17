// Add this package in pubspec.yaml: http: ^0.13.3
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> checkSafety(double lat, double long) async {
  // Use 10.0.2.2 for Android Emulator, or your Laptop's IP (e.g., 192.168.x.x) for real phone
  String url = "http://10.0.2.2:8000/predict_safety?lat=$lat&long=$long&hour=22";
  
  try {
    final response = await http.get(Uri.parse(url));
    
    if (response.statusCode == 200) {
      var data = jsonDecode(response.body);
      print("Safety Score: ${data['safety_score']}");
      print("Zone Color: ${data['zone_color']}");
      
      // TODO: Update your UI color based on data['zone_color']
    }
  } catch (e) {
    print("Error connecting to AI Server: $e");
  }
}