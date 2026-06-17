import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:workmanager/workmanager.dart';
import 'api_service.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();
  factory LocationService() => _instance;

  LocationService._internal();

  StreamSubscription<Position>? _positionStream;
  Position? _currentPosition;
  bool _isTracking = false;

  Position? get currentPosition => _currentPosition;
  bool get isTracking => _isTracking;

  Future<void> initialize() async {
    // Initialize WorkManager
    await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);

    // Check location permissions
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }

    if (permission == LocationPermission.deniedForever) {
      // Handle permanently denied permissions
      return;
    }

    // Get current position
    try {
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      // Handle error
      print('Error getting current position: $e');
    }
  }

  Future<Position?> getCurrentLocation() async {
    try {
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      return _currentPosition;
    } catch (e) {
      print('Error getting current location: $e');
      return null;
    }
  }

  Future<void> startLocationTracking() async {
    if (_isTracking) return;

    _isTracking = true;

    // Register background task
    await Workmanager().registerPeriodicTask(
      'location_tracking',
      'track_location',
      frequency: const Duration(minutes: 15),
      constraints: Constraints(networkType: NetworkType.connected),
    );

    // Start foreground tracking
    _positionStream =
        Geolocator.getPositionStream(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.high,
            distanceFilter: 10, // Update every 10 meters
          ),
        ).listen((Position position) async {
          _currentPosition = position;
          try {
            await ApiService().updateLocation(position.latitude, position.longitude);
            print('Location updated to server: ${position.latitude}, ${position.longitude}');
          } catch (e) {
            print('Failed to send location to server: $e');
          }
        });
  }

  Future<void> stopLocationTracking() async {
    _isTracking = false;

    // Cancel foreground tracking
    await _positionStream?.cancel();
    _positionStream = null;

    // Cancel background task
    await Workmanager().cancelByUniqueName('location_tracking');
  }

  Future<String?> getAddressFromCoordinates(
    double latitude,
    double longitude,
  ) async {
    try {
      List<Placemark> placemarks = await placemarkFromCoordinates(latitude, longitude);
      if (placemarks.isNotEmpty) {
        Placemark place = placemarks[0];
        return '${place.street}, ${place.subLocality}, ${place.locality}, ${place.country}';
      }
    } catch (e) {
      print('Address lookup failed: $e');
    }
    return null;
  }
}

// Background task callback
@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    try {
      // Get current location in background
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      try {
        await ApiService().updateLocation(position.latitude, position.longitude);
        print('Background location updated to server: ${position.latitude}, ${position.longitude}');
      } catch (e) {
        print('Background location send error: $e');
      }

      return true;
    } catch (e) {
      print('Background location error: $e');
      return false;
    }
  });
}
