import { Router, Response } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '../config/firebase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const settingsCol = db.collection('settings');
const auditCol = db.collection('audit_logs');

const SETTINGS_DOC_ID = 'store_config';

/**
 * GET /api/admin/settings
 * Recuperer la configuration du magasin.
 */
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const settingsDoc = await settingsCol.doc(SETTINGS_DOC_ID).get();

    if (!settingsDoc.exists) {
      // Return defaults
      const defaults = {
        storeName: 'Play.tn',
        storeDescription: 'Votre boutique en ligne de jeux video et jouets en Tunisie.',
        storeEmail: 'contact@play.tn',
        storePhone: '+216 XX XXX XXX',
        currency: 'TND',
        locale: 'fr-TN',
        taxRate: 0.19,
        freeShippingThreshold: 150,
        shippingZones: [
          { id: 'tunis', name: 'Grand Tunis', fee: 7 },
          { id: 'north', name: 'Nord', fee: 9 },
          { id: 'center', name: 'Centre', fee: 10 },
          { id: 'south', name: 'Sud', fee: 12 },
        ],
        socialLinks: {
          facebook: '',
          instagram: '',
          twitter: '',
          tiktok: '',
        },
        paymentMethods: {
          cashOnDelivery: true,
          card: false,
          flouci: false,
        },
        orderNotifications: {
          emailOnNewOrder: true,
          emailOnStatusChange: true,
        },
        maintenance: {
          enabled: false,
          message: '',
        },
      };

      res.json({ success: true, data: defaults });
      return;
    }

    res.json({
      success: true,
      data: settingsDoc.data(),
    });
  } catch (error) {
    console.error('[Settings] Erreur lors de la lecture:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recuperation des parametres.',
    });
  }
});

/**
 * PUT /api/admin/settings
 * Mettre a jour la configuration du magasin.
 */
router.put('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: 'Aucune donnee a mettre a jour.',
      });
      return;
    }

    await settingsCol.doc(SETTINGS_DOC_ID).set(
      {
        ...updates,
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: req.user?.uid || '',
      },
      { merge: true }
    );

    // Audit log
    await auditCol.add({
      userId: req.user?.uid,
      userEmail: req.user?.email,
      action: 'settings_updated',
      resource: 'settings',
      resourceId: SETTINGS_DOC_ID,
      details: { fields: Object.keys(updates) },
      ipAddress: req.ip || '',
      createdAt: FieldValue.serverTimestamp(),
    });

    const updated = await settingsCol.doc(SETTINGS_DOC_ID).get();

    res.json({
      success: true,
      message: 'Parametres mis a jour.',
      data: updated.data(),
    });
  } catch (error) {
    console.error('[Settings] Erreur lors de la mise a jour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise a jour des parametres.',
    });
  }
});

export default router;
