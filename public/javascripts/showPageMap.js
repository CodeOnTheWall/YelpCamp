mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});
map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
    // we make a marker
    .setLngLat(campground.geometry.coordinates)
    // then set lat and long of where it should go
    .setPopup(
        // then we set a popup on that marker - when a user clicks
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>`
            )
    )
    .addTo(map)
    // then we add the marker to the map
