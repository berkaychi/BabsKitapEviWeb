# Environment Configuration (Stajyer Dostu)

Bu klasörde Angular uygulamasının farklı ortamlar için ayarları bulunur.

## 📁 Dosyalar

- **`environment.ts`** - Development (geliştirme) ortamı - localhost API'si
- **`environment.prod.ts`** - Production (üretim) ortamı - gerçek sunucu API'si
- **`environment.example.ts`** - Örnek dosya

## 🚀 Basit Kullanım

### Service'te Environment Kullanma

```typescript
// BookService'te böyle kullanılır:
import { environment } from '../../../environments/environment';

@Injectable()
export class BookService {
  constructor(private http: HttpClient) {}

  getAllBooks() {
    // Environment'tan API URL'ini al
    const url = `${environment.apiUrl}/api/books`;
    return this.http.get(url);
  }
}
```

### Development vs Production

```typescript
// Development (environment.ts)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5198'  // .NET API'niz
};

// Production (environment.prod.ts)  
export const environment = {
  production: true,
  apiUrl: 'https://api.kitap-evi.com'  // Gerçek sunucu
};
```

## ⚙️ Angular Build Sistemi

Angular otomatik olarak doğru dosyayı seçer:

```bash
# Development - environment.ts kullanır
ng serve

# Production - environment.prod.ts kullanır  
ng build --configuration production
```

## 🎓 Stajyer İçin Notlar

**Neden environment kullanırız?**
- Development'ta `localhost:5198`
- Production'da gerçek sunucu adresi
- Kod değiştirmeden farklı ortamlarda çalışır

**Basit ve anlaşılır** - karmaşık feature flag'ler ve cache ayarları gelecek aşamalarda öğrenilecek!