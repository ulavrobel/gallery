# Dokumentacja aplikacji galeria
## Instrukcja uruchomienia
### Uruchom MongoDB przy użyciu Dockera:

```docker run -d -p 27017:27017 --name mongo-gallery mongo:latest```

### Zainstaluj należności 

```npm install```

### Uruchom aplikację

```npm start```

## Baza danych (import i eksport) 
### Z wykorzystaniem wiersza poleceń:
#### Import (Mongorestore)
Po uruchomieniu bazy danych na porcie 27017 wykonaj:

```mongorestore --uri="mongodb://localhost:27017" ./backup```

#### Eksport (Mongodump)

```mongodump --uri="mongodb://localhost:27017" --out=./backup```


## Konta użytkowników
### Dostępne konta testowe:

- **Administrator** - login: admin | hasło: admin (Konto generuje się automatycznie przy pierwszym uruchomieniu pustej bazy)
- **Zwykły użytkownik** - login: ulawrobel | hasło: 12345678
- **Zwykły użytkowni** - login: jankowalski | hasło: 12345678

## Funkcjonalności
- **Zarządzanie galeriami:** Tworzenie, edycja i usuwanie własnych galerii. Przeglądanie miniatur zdjęć.
- **Zarządzanie zdjęciami:** Wgrywanie fizycznych zdjęć na serwer z przypisaniem do galerii, edycja nazwy i opisu, usuwanie zdjęcia, dodawanie komentarzy.
- **Panel Administratora:** Dostęp do wszystkich galerii i zarządzania ich twórcami. Możliwość dodawania, przeglądania i usuwania użytkowników z poziomu aplikacji.

## Wykorzystane technologie

- **express** - rdzeń aplikacji.
- **mongoose** - modelowanie danych dla bazy MongoDB.
- **pug** - obsługa widoków HTML.
- **multer** - obsługa formularzy typu multipart oraz przesyłania plików zdjęć na serwer.
- **uuid** - generowanie unikalnych nazw dla plików (ochrona przed nadpisywaniem).
- **bcrypt** - bezpieczne szyfrowanie haseł w bazie danych.
- **jsonwebtoken** & **cookie-parser** - obsługa sesji i autoryzacji oparta na tokenach JWT.
- **swagger-ui-express** & **swagger-jsdoc** - generowanie interaktywnej dokumentacji API.

## Struktura projektu 
- **/models** - schematy bazy danych.
- **/controllers** - logika biznesowa i obsługa żądań.
- **/routes** - definicje endpointów i mapowanie ich na kontrolery.
- **/middleware** - oprogramowanie pośredniczące (weryfikacja tokenów i ról admina).
- **/views** - szablony Pug.
- **/public** - pliki statyczne (wgrane przez użytkowników zdjęcia trafiają do /images).

## Opis modeli baz danych 

### User
- first_name (String) - Imię.
- last_name (String) - Nazwisko.
- username (String) - Unikalny login.
- password (String) - Zaszyfrowane hasło.

### Gallery
- name (String) - Nazwa galerii.
- description (String) - Opis galerii.
- owner (ObjectId) - Referencja do kolekcji User.

### Image
- name (String) - Nazwa obrazka.
- description (String) - Opis obrazka.
- gallery (ObjectId) - Referencja do kolekcji Gallery.

## Dokumentacja Interfejsu API (OpenAPI)

Aby przetestować endpointy i sprawdzić dokumentację z poziomu interfejsu graficznego, wejdź na adres: http://localhost:3000/api-docs