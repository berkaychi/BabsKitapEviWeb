export type AssignmentType = 'category' | 'publisher';

export interface AssignmentConfig {
  type: AssignmentType;
  targetId: number;
  targetName: string;
  modalTitle: string;
  searchPlaceholder: string;
  confirmMessage: string;
  successMessage: string;
}

export interface BookAssignmentResult {
  bookId: number;
  assignmentType: AssignmentType;
  targetId: number;
  success: boolean;
  message?: string;
}

export interface AssignmentFilter {
  excludeAssignedToTarget: boolean;
  searchTerm?: string;
}

export class AssignmentConfigs {
  static category(targetId: number, targetName: string): AssignmentConfig {
    return {
      type: 'category',
      targetId,
      targetName,
      modalTitle: `"${targetName}" Kategorisine Kitap Ekle`,
      searchPlaceholder: 'Kitap adı, yazar veya ISBN ile ara...',
      confirmMessage: 'Seçilen kitaplar kategoriye eklensin mi?',
      successMessage: 'Kitaplar başarıyla kategoriye eklendi.',
    };
  }

  static publisher(targetId: number, targetName: string): AssignmentConfig {
    return {
      type: 'publisher',
      targetId,
      targetName,
      modalTitle: `"${targetName}" Yayınevine Kitap Ekle`,
      searchPlaceholder: 'Kitap adı, yazar veya ISBN ile ara...',
      confirmMessage: 'Seçilen kitaplar yayınevine eklensin mi?',
      successMessage: 'Kitaplar başarıyla yayınevine eklendi.',
    };
  }
}
