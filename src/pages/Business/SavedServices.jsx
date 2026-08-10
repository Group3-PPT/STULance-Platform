import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Heart, Loader2, ShoppingBag, Search, AlertTriangle, Trash2 } from 'lucide-react';
import { savedItemsService } from '../../services/saveditemsservice';
import PaginationBar from '../../components/PaginationBar';
import '../../CSS/SavedServices.css';

// ============================================================
// TRANG DICH VU DA LUU
// Hien thi danh sach dich vu ma nguoi dung da luu yeu thich.
// Cho phep tim kiem, bo luu, va don sach cac dich vu khong kha dung.
// ============================================================
const SavedServices = function () {

    // ============================================================
    // STATE
    // ============================================================

    // Danh sach dich vu da luu
    var stateSaved = useState([]);
    var savedServices = stateSaved[0];
    var setSavedServices = stateSaved[1];

    // Trang thai dang tai du lieu
    var stateLoading = useState(true);
    var loading = stateLoading[0];
    var setLoading = stateLoading[1];

    // ID dang duoc bo luu (de hien spinner)
    var stateRemoving = useState(null);
    var removingId = stateRemoving[0];
    var setRemovingId = stateRemoving[1];

    // Trang thai dang don sach khong kha dung
    var stateClearing = useState(false);
    var clearing = stateClearing[0];
    var setClearing = stateClearing[1];

    // Tu khoa tim kiem
    var stateSearch = useState('');
    var search = stateSearch[0];
    var setSearch = stateSearch[1];

    // ID dang hien confirm bo luu (nhan lan dau = confirm, nhan lan 2 = thuc thi)
    var stateConfirm = useState(null);
    var confirmId = stateConfirm[0];
    var setConfirmId = stateConfirm[1];

    // ============================================================
    // PHAN TRANG
    // ============================================================
    var statePage = useState(1);
    var currentPage = statePage[0];
    var setCurrentPage = statePage[1];

    var stateTotalPages = useState(1);
    var totalPages = stateTotalPages[0];
    var setTotalPages = stateTotalPages[1];

    var stateTotalItems = useState(0);
    var totalItems = stateTotalItems[0];
    var setTotalItems = stateTotalItems[1];

    var pageSize = 20;

    // ============================================================
    // HAM HO TRO
    // ============================================================

    // Dinh dang tien VND
    var formatMoney = function (val) {
        return new Intl.NumberFormat('vi-VN').format(val || 0);
    };

    // ============================================================
    // HAM TAI DU LIEU TU SERVER
    // ============================================================
    var fetchSaved = useCallback(async function (page, keyword) {
        if (!page) page = 1;
        if (!keyword) keyword = '';

        setLoading(true);

        try {
            var res = await savedItemsService.getMySavedServices({
                page: page,
                pageSize: pageSize,
                keyword: keyword || undefined
            });

            if (res.success && res.data) {
                var data = res.data;

                setSavedServices(data.items || []);
                setTotalPages(data.totalPages || 1);
                setTotalItems(data.totalItems || 0);
                setCurrentPage(data.page || 1);
            }

        } catch (err) {
            console.error("Loi tai dich vu da luu:", err);

        } finally {
            setLoading(false);
        }
    }, []);

    // ============================================================
    // EFFECT: Tai du lieu khi component mount
    // ============================================================
    useEffect(function () {
        fetchSaved(1);
    }, [fetchSaved]);

    // ============================================================
    // HAM TIM KIEM
    // ============================================================
    var handleSearch = function () {
        setCurrentPage(1);
        fetchSaved(1, search);
    };

    // ============================================================
    // HAM CHUYEN TRANG
    // ============================================================
    var handlePageChange = function (page) {
        fetchSaved(page, search);
    };

    // ============================================================
    // HAM BO LUU MOT DICH VU
    // ============================================================
    var handleRemove = async function (e, serviceId) {
        e.preventDefault();
        e.stopPropagation();

        setRemovingId(serviceId);

        try {
            await savedItemsService.unsaveService(serviceId);

            // Cap nhat state: loai bo dich vu khoi danh sach
            setSavedServices(function (prev) {
                return prev.filter(function (s) {
                    return s.serviceId !== serviceId;
                });
            });

            setTotalItems(function (prev) {
                return prev - 1;
            });

        } catch (err) {
            console.error("Loi bo luu:", err);

        } finally {
            setRemovingId(null);
            setConfirmId(null);
        }
    };

    // ============================================================
    // HAM DON SACH CAC DICH VU KHONG KHA DUNG
    // ============================================================
    var handleClearUnavailable = async function () {
        setClearing(true);

        try {
            await savedItemsService.clearUnavailableItems();
            fetchSaved(currentPage, search);

        } catch (err) {
            console.error("Loi don danh sach:", err);

        } finally {
            setClearing(false);
        }
    };

    // ============================================================
    // DEM SO DICH VU KHONG KHA DUNG
    // ============================================================
    var unavailableCount = savedServices.filter(function (s) {
        return s.isAvailable === false;
    }).length;

    // ============================================================
    // HIEN THI LOADING NEU DANG TAI
    // ============================================================
    if (loading) {
        return (
            <div className="saved-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="text-center">
                    <Loader2 className="spin text-primary" size={36} />
                    <p className="text-white-50 mt-3" style={{ fontSize: '0.8rem' }}>Dang tai...</p>
                </div>
            </div>
        );
    }

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="saved-page py-4 text-white">
            <Container>

                {/* HEADER: TIEU DE + NUT HANH DONG */}
                <div className="saved-header mb-4">
                    <div className="saved-header-left">
                        <Heart size={20} className="text-danger" fill="#ef4444" />
                        <div>
                            <h4 className="saved-header-title">Dich vu da luu</h4>
                            <p className="saved-header-sub">{totalItems} muc quan tam</p>
                        </div>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                        {unavailableCount > 0 && (
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="fw-bold"
                                disabled={clearing}
                                onClick={handleClearUnavailable}
                                style={{ fontSize: '0.7rem' }}
                            >
                                {clearing ? (
                                    <Loader2 size={11} className="spin me-1" />
                                ) : (
                                    <Trash2 size={11} className="me-1" />
                                )}
                                Xoa {unavailableCount} khong kha dung
                            </Button>
                        )}
                        <Button
                            as={Link}
                            to="/services"
                            variant="primary"
                            size="sm"
                            className="fw-bold"
                            style={{ fontSize: '0.7rem' }}
                        >
                            + Them dich vu
                        </Button>
                    </div>
                </div>

                {/* THANH TIM KIEM */}
                {savedServices.length > 0 && (
                    <div className="saved-toolbar mb-4">
                        <div className="saved-search">
                            <Search size={14} className="saved-search-icon" />
                            <input
                                type="text"
                                placeholder="Tim ten dich vu, tac gia..."
                                value={search}
                                onChange={function (e) { setSearch(e.target.value); }}
                                onKeyDown={function (e) { if (e.key === 'Enter') { handleSearch(); } }}
                            />
                        </div>
                        <Button variant="primary" size="sm" className="fw-bold" onClick={handleSearch}>
                            <Search size={14} className="me-1" /> Tim
                        </Button>
                    </div>
                )}

                {/* TRONG RONG: CHUA LUU DICH VU NAO */}
                {savedServices.length === 0 ? (
                    <div className="saved-empty">
                        <div className="saved-empty-icon"><ShoppingBag size={48} /></div>
                        <h5 className="saved-empty-title">Chua luu dich vu nao</h5>
                        <p className="saved-empty-desc">Kham pha va luu cac dich vu ban quan tam</p>
                        <Button
                            as={Link}
                            to="/services"
                            variant="primary"
                            className="saved-btn-primary"
                        >
                            Kham pha dich vu
                        </Button>
                    </div>
                ) : (
                    /* DANH SACH CARD DICH VU DA LUU */
                    <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-3">
                        {savedServices.map(function (svc, index) {
                            var isUnavail = svc.isAvailable === false;
                            var isRemoving = removingId === svc.serviceId;
                            var isConfirm = confirmId === svc.serviceId;

                            return (
                                <Col key={svc.serviceId}>
                                    <div
                                        className={'tiktok-card glass-card shadow-lg animate-fade-in' + (isUnavail ? ' unavailable-card' : '')}
                                        style={{ animationDelay: (index * 0.05) + 's' }}
                                    >
                                        {/* ANH BIA + OVERLAY KHONG KHA DUNG */}
                                        <Link to={'/service-detail/' + svc.serviceId}>
                                            <img
                                                src={svc.sampleImageUrl || 'https://placehold.co/300x500/020617/white?text=STULance'}
                                                alt={svc.title}
                                                className="tiktok-bg-img"
                                                loading="lazy"
                                            />
                                            {isUnavail && (
                                                <div className="tiktok-unavail-overlay">
                                                    <AlertTriangle size={20} />
                                                    <span>Khong kha dung</span>
                                                </div>
                                            )}
                                        </Link>

                                        {/* NUT BO LUU (BEN PHAI) */}
                                        <div className="tiktok-side-actions">
                                            <div
                                                className="action-circle"
                                                onClick={function (e) {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    if (isConfirm) {
                                                        handleRemove(e, svc.serviceId);
                                                    } else {
                                                        setConfirmId(svc.serviceId);
                                                    }
                                                }}
                                            >
                                                {isRemoving ? (
                                                    <Loader2 size={18} className="spin" />
                                                ) : isConfirm ? (
                                                    <div className="confirm-mini">
                                                        <span
                                                            className="confirm-mini-yes"
                                                            onClick={function (e) {
                                                                e.stopPropagation();
                                                                handleRemove(e, svc.serviceId);
                                                            }}
                                                        >
                                                            Co
                                                        </span>
                                                        <span
                                                            className="confirm-mini-no"
                                                            onClick={function (e) {
                                                                e.stopPropagation();
                                                                setConfirmId(null);
                                                            }}
                                                        >
                                                            Khong
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <Heart size={22} fill="#ef4444" color="#ef4444" />
                                                )}
                                                {!isConfirm && !isRemoving && (
                                                    <span>{isUnavail ? 'Xoa' : 'Da luu'}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* NOI DUNG OVERLAY: TEN + TIEU DE + GIA */}
                                        <div className="tiktok-overlay-content">
                                            <Link
                                                to={'/service-detail/' + svc.serviceId}
                                                className="text-decoration-none text-white fw-bold x-small-text"
                                            >
                                                @{svc.studentName}
                                            </Link>
                                            <h6 className="service-card-title text-white line-clamp-2 mt-1">
                                                {svc.title}
                                            </h6>
                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                <div className="service-price-tag text-white fw-bold">
                                                    {formatMoney(svc.price)}d
                                                </div>
                                                <Link
                                                    to={'/service-detail/' + svc.serviceId}
                                                    className="btn-buy-now-sm text-decoration-none"
                                                >
                                                    XEM
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                )}

                {/* PHAN TRANG */}
                <PaginationBar
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </Container>
        </div>
    );
};

export default SavedServices;
